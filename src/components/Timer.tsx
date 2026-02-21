import React, { useState, useRef, useEffect } from 'react';

interface TimerProps {
    seconds: number;
    mode: 'stopwatch' | 'timer';
    isRunning?: boolean;
    onDurationChange?: (seconds: number) => void;
    themeClass?: string;
}

type EditSegment = 'hours' | 'minutes' | 'seconds' | null;

export const Timer: React.FC<TimerProps> = ({ seconds, mode, isRunning, onDurationChange, themeClass = "text-emerald-400" }) => {
    const [editSegment, setEditSegment] = useState<EditSegment>(null);
    const [hVal, setHVal] = useState("0");
    const [mVal, setMVal] = useState("00");
    const [sVal, setSVal] = useState("00");

    const inputRef = useRef<HTMLInputElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Flashing effect for the active segment
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (editSegment) {
            interval = setInterval(() => {
                setIsVisible(prev => !prev);
            }, 500);
        } else {
            setIsVisible(true);
        }
        return () => clearInterval(interval);
    }, [editSegment]);

    // Focus hidden input when entering edit mode
    useEffect(() => {
        if (editSegment && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editSegment]);

    const handleSegmentClick = (segment: EditSegment) => {
        if (mode === 'timer' && !isRunning) {
            if (!editSegment) {
                // Initialize values from current seconds only when first entering edit mode
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = seconds % 60;
                setHVal(h.toString());
                setMVal(m.toString().padStart(2, '0'));
                setSVal(s.toString().padStart(2, '0'));
            }
            setEditSegment(segment);
        }
    };

    const commitChanges = () => {
        let h = parseInt(hVal, 10) || 0;
        let m = parseInt(mVal, 10) || 0;
        let s = parseInt(sVal, 10) || 0;

        // Carry over excesses (e.g. 90 seconds -> 1 min, 30 sec)
        if (s >= 60) {
            m += Math.floor(s / 60);
            s = s % 60;
        }
        if (m >= 60) {
            h += Math.floor(m / 60);
            m = m % 60;
        }

        const totalSeconds = h * 3600 + m * 60 + s;
        if (totalSeconds >= 0 && onDurationChange) {
            onDurationChange(totalSeconds);
        }

        setEditSegment(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            commitChanges();
        } else if (e.key === 'Escape') {
            setEditSegment(null); // Cancel
        } else if (e.key === 'ArrowRight' || e.key === ':') {
            e.preventDefault();
            if (editSegment === 'hours') setEditSegment('minutes');
            else if (editSegment === 'minutes') setEditSegment('seconds');
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (editSegment === 'seconds') setEditSegment('minutes');
            else if (editSegment === 'minutes') setEditSegment('hours');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                if (editSegment === 'seconds') setEditSegment('minutes');
                else if (editSegment === 'minutes') setEditSegment('hours');
            } else {
                if (editSegment === 'hours') setEditSegment('minutes');
                else if (editSegment === 'minutes') setEditSegment('seconds');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // We only care about the last character typed to shift it in
        const val = e.target.value;
        const lastChar = val.slice(-1);

        // Ensure it's a number
        if (!/^\d$/.test(lastChar)) {
            // Reset the hidden input's value so it doesn't build up garbage
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        if (editSegment === 'hours') {
            setHVal(prev => (prev === "0" ? lastChar : (prev + lastChar).slice(-2))); // Max 99 hours
        } else if (editSegment === 'minutes') {
            setMVal(prev => (prev === "00" ? "0" + lastChar : prev.slice(-1) + lastChar));
        } else if (editSegment === 'seconds') {
            setSVal(prev => (prev === "00" ? "0" + lastChar : prev.slice(-1) + lastChar));
        }

        // Reset the value so we continually just get the last typed digit
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    // Derived display values when NOT editing
    const displayH = Math.floor(seconds / 3600);
    const displayM = Math.floor((seconds % 3600) / 60);
    const displayS = seconds % 60;

    const showHStr = displayH > 0 || editSegment === 'hours' || (editSegment && parseInt(hVal, 10) > 0);

    return (
        <div
            className={`text-6xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl select-none flex items-center justify-center relative min-h-[72px] ${(mode === 'timer' && !isRunning) || editSegment ? 'no-drag pointer-events-auto' : ''}`}
            title={mode === 'timer' ? "Click a segment to edit" : "Stopwatch Mode"}
        >
            {editSegment && (
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    className="opacity-0 absolute inset-0 w-full h-full cursor-text z-0"
                    onChange={handleInputChange}
                    onBlur={commitChanges}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            )}

            <div className={`flex items-center pointer-events-none ${editSegment ? themeClass : ''}`}>
                {/* HOURS */}
                {showHStr && (
                    <>
                        <span
                            className={`transition-all duration-200 ${((mode === 'timer' && !isRunning) || editSegment) ? 'cursor-pointer hover:brightness-125 pointer-events-auto' : ''}`}
                            style={{ opacity: editSegment === 'hours' && !isVisible ? 0 : 1 }}
                            onClick={() => handleSegmentClick('hours')}
                        >
                            {editSegment ? hVal : displayH}
                        </span>
                        <span className="mx-1 opacity-50 pointer-events-none">:</span>
                    </>
                )}

                {/* MINUTES */}
                <span
                    className={`transition-all duration-200 ${((mode === 'timer' && !isRunning) || editSegment) ? 'cursor-pointer hover:brightness-125 pointer-events-auto' : ''}`}
                    style={{ opacity: editSegment === 'minutes' && !isVisible ? 0 : 1 }}
                    onClick={() => handleSegmentClick('minutes')}
                >
                    {editSegment ? mVal : displayM.toString().padStart(2, '0')}
                </span>

                <span className="mx-1 opacity-50 pointer-events-none">:</span>

                {/* SECONDS */}
                <span
                    className={`transition-all duration-200 ${((mode === 'timer' && !isRunning) || editSegment) ? 'cursor-pointer hover:brightness-125 pointer-events-auto' : ''}`}
                    style={{ opacity: editSegment === 'seconds' && !isVisible ? 0 : 1 }}
                    onClick={() => handleSegmentClick('seconds')}
                >
                    {editSegment ? sVal : displayS.toString().padStart(2, '0')}
                </span>
            </div>
        </div>
    );
};
