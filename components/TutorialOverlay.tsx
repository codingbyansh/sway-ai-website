import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { User } from '../types';
import { userService } from '../services/userService';

interface TutorialOverlayProps {
    user: User | null;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ user }) => {
    const [run, setRun] = useState(false);
    useEffect(() => {
        if (!user || !user.email) return;

        const storageKey = `sync_tutorial_seen_${user.email}`;
        const hasSeenLocal = localStorage.getItem(storageKey);
        const hasSeenOnAccount = user.tutorialSeen === true;

        // If they have any history (saved replies or fewer than max credits), 
        // mark as seen and don't show.
        const maxCredits = user.isPremium ? 50 : 10;
        const reflectsExistingUser = (user.credits < maxCredits) || (user.savedReplies && user.savedReplies.length > 0);

        if (reflectsExistingUser && !hasSeenOnAccount) {
            userService.setTutorialSeen(user.email);
            localStorage.setItem(storageKey, 'true');
            return;
        }

        if (!hasSeenLocal && !hasSeenOnAccount && !reflectsExistingUser) {
            const timer = setTimeout(() => {
                setRun(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            if (user && user.email) {
                localStorage.setItem(`sync_tutorial_seen_${user.email}`, 'true');
                userService.setTutorialSeen(user.email);
            }
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            content: "Welcome to Sync AI! Your personalized dating assistant. Let's take a quick tour of what you can do.",
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#tour-input-section',
            content: 'Here is where the magic starts. You can either paste a text message or upload a screenshot of your chat to get started.',
            placement: 'bottom',
        },
        {
            target: '#tour-options',
            content: 'Customize your reply! Choose the vibe (Safe to Bold), how you want the text to read (Casual to Deep), and whether or not to include emojis. You can even choose the language!',
            placement: 'bottom',
        },
        {
            target: '#tour-generate',
            content: "Once you're happy with your settings, click here to generate 3 personalized AI reply options.",
            placement: 'bottom',
        },
        {
            target: '#tour-ghosting',
            content: 'Did they disappear? Use our Ghosting Rescue tool to craft the perfect message to get them talking again.',
            placement: 'bottom',
        },
        {
            target: '#tour-conflict',
            content: 'Having an argument? The "Talk It Out" feature acts as an emotionally intelligent mediator to help resolve the issue peacefully.',
            placement: 'bottom',
        },
    ];

    if (!user) return null;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            disableOverlayClose // Prevent accidental closing
            disableScrolling={false} // Prevent freeze on scroll
            spotlightPadding={10}
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#f43f6e', // Matching sync-primary
                    textColor: '#1f2937',
                    backgroundColor: '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.75)',
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    fontWeight: 600,
                    borderRadius: 12,
                },
                buttonSkip: {
                    color: '#9ca3af',
                    fontSize: '14px'
                }
            }}
        />
    );
};

export default TutorialOverlay;
