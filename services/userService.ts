import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseSetup } from './firebase';
import { User as AppUser } from '../types';

const FREE_DAILY_CREDITS = 9999;
const PREMIUM_DAILY_CREDITS = 9999;
const FIRESTORE_TIMEOUT_MS = 5000;

// Helper: wrap a promise with a timeout
const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T | Error): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve, reject) => setTimeout(() => {
      console.warn(`Firestore operation timed out after ${ms}ms`);
      if (fallback instanceof Error) {
        reject(fallback);
      } else {
        resolve(fallback);
      }
    }, ms))
  ]);
};

// Helper: get local date string (YYYY-MM-DD)
const getLocalToday = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Local storage helpers (cache only — Firebase is source of truth)
const getLocalUser = (email: string): AppUser | null => {
  try {
    const raw = localStorage.getItem(`sync_user_${email}`);
    if (raw) return JSON.parse(raw);

    const activeRaw = localStorage.getItem('sync_user');
    if (activeRaw) {
      const activeUser = JSON.parse(activeRaw);
      if (activeUser.email === email) return activeUser;
    }
  } catch { return null; }
  return null;
};

const saveLocalUser = (user: AppUser) => {
  try {
    localStorage.setItem(`sync_user_${user.email}`, JSON.stringify(user));
    localStorage.setItem('sync_user', JSON.stringify(user));
  } catch { }
};

// Create a new user object
const createLocalUser = (email: string, name: string, isPremium = true): AppUser => ({
  name,
  email,
  isPremium: true,
  credits: PREMIUM_DAILY_CREDITS,
  lastCreditReset: getLocalToday(),
  savedReplies: [],
  tutorialSeen: false,
});

export const userService = {
  getLocalUser(email: string): AppUser | null {
    return getLocalUser(email);
  },

  async getUser(email: string): Promise<AppUser | null> {
    const normalizedEmail = email.toLowerCase();
    const localUser = getLocalUser(normalizedEmail);
    if (!isFirebaseSetup || !db) return localUser;
    try {
      const result = await withTimeout(
        getDoc(doc(db, 'users', normalizedEmail)),
        FIRESTORE_TIMEOUT_MS,
        new Error("timeout")
      ) as any;

      if (result && result.exists()) {
        const userData = result.data() as AppUser;
        // Ensure savedReplies array exists
        if (!userData.savedReplies) userData.savedReplies = [];
        userData.isPremium = true;
        userData.credits = PREMIUM_DAILY_CREDITS;
        // Only reset credits if it's a new day — NEVER touch savedReplies
        const processed = this.checkAndResetCreditsOnly(userData);
        // Write updated credits back to Firebase if they were reset
        if (processed.lastCreditReset !== userData.lastCreditReset) {
          updateDoc(doc(db, 'users', normalizedEmail), {
            credits: processed.credits,
            lastCreditReset: processed.lastCreditReset,
          }).catch(err => console.warn("Credit reset sync failed:", err.message));
        }
        saveLocalUser(processed);
        return processed;
      }
      return null;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      return localUser || null;
    }
  },

  async createUser(email: string, name: string, isPremium = false): Promise<AppUser> {
    const normalizedEmail = email.toLowerCase();
    const newUser = createLocalUser(normalizedEmail, name, isPremium);
    saveLocalUser(newUser);

    if (isFirebaseSetup && db) {
      // Non-blocking fire-and-forget to prevent UI hang if Firestore is down/slow
      setDoc(doc(db, 'users', normalizedEmail), newUser).catch(err => {
        console.warn("Firestore write failed (non-blocking):", err.message);
      });
    }
    return newUser;
  },

  /**
   * Only resets credits when it's a new day.
   * Saved replies are NEVER auto-deleted — they persist across days/devices.
   */
  checkAndResetCreditsOnly(user: AppUser): AppUser {
    const today = getLocalToday();
    if (user.lastCreditReset !== today) {
      const dailyAllowance = user.isPremium ? PREMIUM_DAILY_CREDITS : FREE_DAILY_CREDITS;
      user.credits = dailyAllowance;
      user.lastCreditReset = today;
      // NOTE: savedReplies are NOT cleared here — they persist forever
    }
    return user;
  },

  // Keep backward compat — alias
  async checkAndResetCredits(user: AppUser): Promise<AppUser> {
    return this.checkAndResetCreditsOnly(user);
  },

  async deductCredit(email: string): Promise<AppUser> {
    const normalizedEmail = email.toLowerCase();
    let user = getLocalUser(normalizedEmail);
    if (!user) user = await this.getUser(normalizedEmail);
    if (!user) user = await this.createUser(normalizedEmail, 'User');

    // Force values
    user.isPremium = true;
    user.credits = PREMIUM_DAILY_CREDITS;
    saveLocalUser(user);

    if (isFirebaseSetup && db) {
      updateDoc(doc(db, 'users', normalizedEmail), { isPremium: true, credits: user.credits })
        .catch(err => console.warn("Credit deduct write failed:", err.message));
    }

    return user;
  },

  async upgradeUser(email: string): Promise<AppUser> {
    const normalizedEmail = email.toLowerCase();
    let user = getLocalUser(normalizedEmail);
    if (!user) user = await this.getUser(normalizedEmail);
    if (!user) user = await this.createUser(normalizedEmail, 'User', true);

    user.isPremium = true;
    user.credits = PREMIUM_DAILY_CREDITS;
    saveLocalUser(user);

    if (isFirebaseSetup && db) {
      updateDoc(doc(db, 'users', normalizedEmail), {
        isPremium: true,
        credits: user.credits
      }).catch(err => console.warn("Upgrade write failed:", err.message));
    }

    return user;
  },

  async syncUser(email: string, name: string): Promise<AppUser> {
    const normalizedEmail = email.toLowerCase();
    // Always try Firebase first to get the latest data (credits + saved replies)
    let user = await this.getUser(normalizedEmail);
    if (!user) {
      user = await this.createUser(normalizedEmail, name);
    }
    // Ensure savedReplies always exists
    if (!user.savedReplies) {
      user.savedReplies = [];
    }
    saveLocalUser(user);
    return user;
  },

  async saveReply(email: string, text: string, source: 'ReplyWithConfidence' | 'Ghosting' | 'Conflict'): Promise<AppUser | null> {
    const normalizedEmail = email.toLowerCase();
    let user = getLocalUser(normalizedEmail);
    if (!user) user = await this.getUser(normalizedEmail);
    if (!user) return null;

    // Check daily credit reset (but NOT saved replies)
    user = this.checkAndResetCreditsOnly(user);

    const limit = 9999;
    if ((user.savedReplies?.length || 0) >= limit) {
      throw new Error(`Saved replies limit (${limit}) reached. Delete some to save more.`);
    }

    const newReply = {
      id: crypto.randomUUID(),
      text,
      source,
      timestamp: new Date().toISOString()
    };

    user.savedReplies = [newReply, ...(user.savedReplies || [])];
    saveLocalUser(user);

    if (isFirebaseSetup && db) {
      updateDoc(doc(db, 'users', normalizedEmail), { savedReplies: user.savedReplies })
        .catch(err => console.warn("saveReply write failed:", err.message));
    }

    return user;
  },

  async removeSavedReply(email: string, replyId: string): Promise<AppUser | null> {
    const normalizedEmail = email.toLowerCase();
    let user = getLocalUser(normalizedEmail);
    if (!user) user = await this.getUser(normalizedEmail);
    if (!user) return null;

    user.savedReplies = (user.savedReplies || []).filter(r => r.id !== replyId);
    saveLocalUser(user);

    if (isFirebaseSetup && db) {
      updateDoc(doc(db, 'users', normalizedEmail), { savedReplies: user.savedReplies })
        .catch(err => console.warn("removeSavedReply write failed:", err.message));
    }

    return user;
  },

  async setTutorialSeen(email: string): Promise<AppUser | null> {
    const normalizedEmail = email.toLowerCase();
    let user = getLocalUser(normalizedEmail);
    if (!user) user = await this.getUser(normalizedEmail);
    if (!user) return null;

    user.tutorialSeen = true;
    saveLocalUser(user);

    if (isFirebaseSetup && db) {
      updateDoc(doc(db, 'users', normalizedEmail), { tutorialSeen: true })
        .catch(err => console.warn("setTutorialSeen write failed:", err.message));
    }

    return user;
  }
};
