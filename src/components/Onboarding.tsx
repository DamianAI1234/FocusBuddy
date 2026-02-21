import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { MousePointerClick, ArrowUpRight, ArrowDown } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
    ui: any;
}

export function Onboarding({ onComplete, ui }: OnboardingProps) {
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [targetBounds, setTargetBounds] = useState<DOMRect | null>(null);

    const steps = [
        {
            title: "Welcome to Focus Buddy! 👋",
            description: "Your new personal productivity assistant. I live right here on your desktop to help you stay focused, healthy, and on track.",
            highlightId: "none",
            arrowPosition: "center", // Where the arrow should be relative to the target
            arrowIcon: MousePointerClick
        },
        {
            title: "The Focus Timer ⏱️",
            description: "Click the timer to track your deep work sessions. Simple and distraction-free.",
            highlightId: "focus-timer-area",
            arrowPosition: "top",
            cardPosition: "bottom",
            arrowIcon: ArrowDown
        },
        {
            title: "Focus Assist 🌙",
            description: "Enable this during deep work to suppress all non-critical Desktop Buddy notifications and minimize distractions.",
            highlightId: "btn-dnd",
            arrowPosition: "bottom-left",
            cardPosition: "bottom",
            arrowIcon: ArrowUpRight
        },
        {
            title: "Activity Reminders 🔔",
            description: "I'll gently remind you to drink water, stretch, or rest your eyes based on the intervals you select here. No more feeling stiff after a long coding session!",
            highlightId: "btn-reminders",
            arrowPosition: "bottom-left",
            cardPosition: "bottom",
            arrowIcon: ArrowUpRight
        },
        {
            title: "Make it Yours 🎨",
            description: "Click the gear icon to customize my colors and background to match your exact vibe and workspace setup.",
            highlightId: "btn-settings",
            arrowPosition: "bottom-left",
            cardPosition: "bottom",
            arrowIcon: ArrowUpRight
        },
        {
            title: "Dock Minimizer 🔽",
            description: "Need your screen back? Click here to minimize me down to your system tray.",
            highlightId: "btn-minimize",
            arrowPosition: "bottom-left",
            cardPosition: "bottom",
            arrowIcon: ArrowUpRight
        },
        {
            title: "Good to Go! 🚀",
            description: "You can close Focus Buddy entirely by clicking here. Enjoy your productive sessions!",
            highlightId: "btn-close",
            arrowPosition: "bottom-left",
            cardPosition: "bottom",
            arrowIcon: ArrowUpRight
        }
    ];

    const currentStep = steps[step];

    useEffect(() => {
        // Find the element and get its bounding rect for the spotlight and arrows
        if (currentStep.highlightId !== "none") {
            const el = document.getElementById(currentStep.highlightId);
            if (el) {
                setTargetBounds(el.getBoundingClientRect());
            } else {
                setTargetBounds(null);
            }
        } else {
            setTargetBounds(null);
        }
    }, [step, currentStep.highlightId]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    // Dynamic absolute positioning for the spotless overlay hole
    const getHoleStyle = (): any => {
        if (!targetBounds) {
            return {
                opacity: 0,
                pointerEvents: 'none'
            };
        }

        // Add 12px of breathing room around the target element
        const padding = 12;
        return {
            position: 'absolute',
            left: targetBounds.left - padding,
            top: targetBounds.top - padding,
            width: targetBounds.width + (padding * 2),
            height: targetBounds.height + (padding * 2),
            borderRadius: '16px',
            // The massive shadow creates the dark screen everywhere else
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.85), 0 0 30px 5px ${theme.hex}33`,
            border: `1px solid rgba(255,255,255,0.2)`,
            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 40
        };
    };

    // Calculate absolute styles for the arrow based on target bounds
    const getArrowStyle = () => {
        if (!targetBounds || currentStep.arrowPosition === 'center') return { display: 'none' };

        const style: any = {
            position: 'absolute',
            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 50
        };

        const cx = targetBounds.left + (targetBounds.width / 2);

        // Position the arrow dynamically 40px away from the target
        switch (currentStep.arrowPosition) {
            case 'bottom':
                style.left = `${cx - 24}px`; // center horizontally
                style.top = `${targetBounds.bottom + 40}px`;
                break;
            case 'bottom-left':
                style.left = `${targetBounds.left - 48}px`;
                style.top = `${targetBounds.bottom + 20}px`;
                break;
            case 'top':
                style.left = `${cx - 24}px`;
                style.top = `${targetBounds.top - 68}px`; // 48px icon + 20px gap
                break;
        }

        return style;
    };

    const ArrowIcon = currentStep.arrowIcon;

    return (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
            {/* The base backdrop applies when there's NO target, or acts as a base */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-auto ${!targetBounds ? 'opacity-80 backdrop-blur-sm' : 'opacity-0'}`}
            />

            {/* Simulated target box with massive shadow overlay trick */}
            <div style={getHoleStyle()} />

            {/* Dynamic Arrow */}
            <div
                className={`z-50 text-white opacity-90 animate-bounce transition-all duration-700`}
                style={getArrowStyle()}
            >
                <ArrowIcon size={48} strokeWidth={1.5} className="drop-shadow-lg" />
            </div>

            {/* Content Container */}
            <div className={`absolute left-4 right-4 ${currentStep.cardPosition === 'top' ? 'top-6' : 'bottom-6'} z-50 ${ui.cardBg} backdrop-blur-3xl rounded-2xl p-5 shadow-2xl border ${theme.borderClass} pointer-events-auto animate-in ${currentStep.cardPosition === 'top' ? 'slide-in-from-top' : 'slide-in-from-bottom'} flex flex-col gap-2 transition-all duration-700 ease-in-out`}>

                <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-bold ${ui.text} tracking-tight`}>{currentStep.title}</h3>
                    <div className="flex gap-1.5 mt-1.5 shrink-0 ml-4">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === step ? `w-6 ${theme.bgClass} shadow-sm` : `w-1.5 ${ui.textMuted} opacity-30`}`}
                            />
                        ))}
                    </div>
                </div>

                <p className={`text-sm ${ui.textMuted} leading-relaxed min-h-[50px] mt-1`}>
                    {currentStep.description}
                </p>

                <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-4">
                    <div className="flex gap-2">
                        <button
                            onClick={onComplete}
                            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${ui.textMuted} hover:${ui.text} hover:bg-white/5`}
                        >
                            Skip Tour
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={step === 0}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${step === 0 ? 'opacity-0 cursor-default' : `${ui.textMuted} hover:${ui.text} hover:bg-white/5`}`}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2 rounded-xl text-sm font-bold tracking-wide transition-all hover:scale-105 active:scale-95 ${theme.bgClass} text-white shadow-lg shadow-black/20`}
                        >
                            {step === steps.length - 1 ? "Let's Go!" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
