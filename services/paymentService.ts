/**
 * paymentService.ts
 * Talks to the Sync AI backend for credit purchases and premium upgrades.
 * In mock mode the backend returns instant success — no real money moves.
 */

import { auth } from './firebase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const MOCK_EMAIL_HEADER = 'X-Mock-Email'; // used when Firebase Admin is in mock mode

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  amountInPaise: number;
  amountDisplay: string;
  description: string;
}

export interface PremiumPlan {
  id: string;
  name: string;
  amountInPaise: number;
  amountDisplay: string;
  dailyCredits: number;
  savedRepliesLimit: number;
  description: string;
}

export interface Catalog {
  creditPacks: CreditPack[];
  premiumPlan: PremiumPlan;
  isMockMode: boolean;
  razorpayKeyId: string | null;
}

export interface PaymentResult {
  success: boolean;
  isMock: boolean;
  message: string;
  credits: number;
  bonusCredits: number;
  isPremium: boolean;
}

// ─── Auth headers ─────────────────────────────────────────────────────────────

/**
 * Builds the correct auth header.
 * - In real mode: gets a Firebase ID token from the current user.
 * - In mock mode (no auth): falls back to X-Mock-Email header.
 */
const getAuthHeaders = async (userEmail: string): Promise<Record<string, string>> => {
  try {
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
  } catch { /* fall through to mock */ }

  // Fallback: mock header for local dev / when Firebase Admin is not set up
  return { [MOCK_EMAIL_HEADER]: userEmail };
};

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/payments/catalog
 * Returns available credit packs and premium plan details.
 */
export const fetchCatalog = async (): Promise<Catalog> => {
  const res = await fetch(`${BACKEND_URL}/api/payments/catalog`);
  if (!res.ok) throw new Error('Failed to fetch payment catalog');
  return res.json();
};

/**
 * GET /api/credits
 * Fetches the user's current credits from the backend (also triggers daily reset).
 */
export const fetchUserCredits = async (email: string) => {
  const headers = await getAuthHeaders(email);
  const res = await fetch(`${BACKEND_URL}/api/credits`, { headers });
  if (!res.ok) throw new Error('Failed to fetch credits');
  return res.json() as Promise<{
    credits: number;
    bonusCredits: number;
    totalCredits: number;
    isPremium: boolean;
    lastCreditReset: string;
    wasReset: boolean;
  }>;
};

/**
 * POST /api/credits/deduct
 * Deducts 1 credit server-side (bonus credits used first).
 */
export const deductCreditBackend = async (email: string) => {
  const headers = await getAuthHeaders(email);
  const res = await fetch(`${BACKEND_URL}/api/credits/deduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Credit deduction failed');
  return data as { success: boolean; credits: number; bonusCredits: number; totalCredits: number };
};

/**
 * POST /api/payments/order  →  POST /api/payments/verify
 * Full flow: create order → (mock) verify → benefit applied.
 *
 * In MOCK mode this instantly completes the payment.
 * In LIVE mode it returns a Razorpay order for the frontend to open the checkout.
 */
export const purchaseCreditPack = async (
  email: string,
  packId: string,
  catalog: Catalog
): Promise<PaymentResult> => {
  const headers = await getAuthHeaders(email);

  // Step 1 — Create order
  const orderRes = await fetch(`${BACKEND_URL}/api/payments/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ type: 'credit_pack', packId }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) {
    const detail = order.message || order.error || 'Failed to create order';
    throw new Error(detail);
  }

  if (order.isMock) {
    // Step 2 — Mock: immediately verify
    return verifyPayment(email, { orderId: order.orderId, type: 'credit_pack', packId });
  }

  // Step 2 — Real: open Razorpay checkout, then verify
  return openRazorpayCheckout(order, email, catalog, 'credit_pack', packId);
};

/**
 * Purchase Premium subscription.
 */
export const purchasePremium = async (email: string, catalog: Catalog): Promise<PaymentResult> => {
  const headers = await getAuthHeaders(email);

  const orderRes = await fetch(`${BACKEND_URL}/api/payments/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ type: 'premium' }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) {
    const detail = order.message || order.error || 'Failed to create premium order';
    throw new Error(detail);
  }

  if (order.isMock) {
    return verifyPayment(email, { orderId: order.orderId, type: 'premium' });
  }

  return openRazorpayCheckout(order, email, catalog, 'premium');
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function verifyPayment(
  email: string,
  payload: { orderId: string; type: string; packId?: string; paymentId?: string; signature?: string }
): Promise<PaymentResult> {
  const headers = await getAuthHeaders(email);
  const res = await fetch(`${BACKEND_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment verification failed');
  return data as PaymentResult;
}

/**
 * Opens the Razorpay checkout widget (real payments only).
 * Requires the Razorpay checkout.js script to be loaded in index.html.
 */
function openRazorpayCheckout(
  order: any,
  email: string,
  catalog: Catalog,
  type: string,
  packId?: string
): Promise<PaymentResult> {
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: catalog.razorpayKeyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Sync AI',
      description: order.product?.description || 'Sync AI Purchase',
      order_id: order.orderId,
      prefill: { email },
      theme: { color: '#ff2c70' },
      handler: async (response: any) => {
        try {
          const result = await verifyPayment(email, {
            orderId: order.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            type,
            packId,
          });
          resolve(result);
        } catch (err: any) {
          reject(new Error(err.message || 'Payment verification failed'));
        }
      },
    });
    rzp.on('payment.failed', (response: any) => {
      reject(new Error(response.error?.description || 'Payment failed'));
    });
    rzp.open();
  });
}
