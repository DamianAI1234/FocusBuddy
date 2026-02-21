import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface ControlsProps {
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    themeClass?: { bg: string, shadow: string };
    resetTheme?: { bg: string, text: string };
}

export const Controls: React.FC<ControlsProps> = ({ isRunning, onStart, onPause, onReset, themeClass = { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' }, resetTheme = { bg: 'bg-gray-700', text: 'text-white/70 hover:text-white' } }) => {
    return (
        <div className="flex gap-4 items-center justify-center mt-6">
            {!isRunning ? (
                <button
                    onClick={onStart}
                    className={`p-4 rounded-full transition-all text-white shadow-lg active:scale-95 ${themeClass.bg} ${themeClass.shadow} hover:brightness-110`}
                    title="Start Focus"
                >
                    <Play fill="currentColor" size={24} />
                </button>
            ) : (
                <button
                    onClick={onPause}
                    className="p-4 rounded-full bg-amber-500 hover:bg-amber-400 transition-all text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-95"
                    title="Pause"
                >
                    <Pause fill="currentColor" size={24} />
                </button>
            )}

            <button
                onClick={onReset}
                className={`p-3 rounded-full transition-all shadow-lg active:scale-95 ${resetTheme.bg} hover:brightness-110 ${resetTheme.text}`}
                title="Reset Timer"
            >
                <RotateCcw size={20} />
            </button>
        </div>
    );
};
