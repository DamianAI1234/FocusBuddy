import { useState, useEffect } from 'react';

export type ThemeColor = 'emerald' | 'amber' | 'rose' | 'indigo' | 'violet' | 'black' | 'white' | 'slate';
export type ThemeBg = 'dark' | 'light';

export const THEMES: Record<ThemeColor, {
    bgClass: string;
    textClass: string;
    borderClass: string;
    shadowClass: string;
    label: string;
    hex: string;
}> = {
    emerald: {
        bgClass: 'bg-emerald-500',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500',
        shadowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        label: 'Emerald',
        hex: '#10b981'
    },
    amber: {
        bgClass: 'bg-amber-500',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500',
        shadowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        label: 'Amber',
        hex: '#f59e0b'
    },
    rose: {
        bgClass: 'bg-rose-500',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500',
        shadowClass: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]',
        label: 'Rose',
        hex: '#f43f5e'
    },
    indigo: {
        bgClass: 'bg-indigo-500',
        textClass: 'text-indigo-400',
        borderClass: 'border-indigo-500',
        shadowClass: 'shadow-[0_0_15px_rgba(99,102,241,0.1)]',
        label: 'Indigo',
        hex: '#6366f1'
    },
    violet: {
        bgClass: 'bg-violet-500',
        textClass: 'text-violet-400',
        borderClass: 'border-violet-500',
        shadowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.1)]',
        label: 'Violet',
        hex: '#8b5cf6'
    },
    black: {
        bgClass: 'bg-black',
        textClass: 'text-neutral-300',
        borderClass: 'border-black',
        shadowClass: 'shadow-[0_0_15px_rgba(0,0,0,0.2)]',
        label: 'Black',
        hex: '#000000'
    },
    white: {
        bgClass: 'bg-white',
        textClass: 'text-white',
        borderClass: 'border-white',
        shadowClass: 'shadow-[0_0_15px_rgba(255,255,255,0.2)]',
        label: 'White',
        hex: '#ffffff'
    },
    slate: {
        bgClass: 'bg-slate-500',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500',
        shadowClass: 'shadow-[0_0_15px_rgba(100,116,139,0.1)]',
        label: 'Grey',
        hex: '#64748b'
    }
};

export function useTheme() {
    const [themeName, setThemeName] = useState<ThemeColor>('emerald');
    const [bgName, setBgName] = useState<ThemeBg>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('focus-buddy-theme') as ThemeColor;
        if (savedTheme && THEMES[savedTheme]) {
            setThemeName(savedTheme);
        }
        const savedBg = localStorage.getItem('focus-buddy-bg') as ThemeBg;
        if (savedBg && ['dark', 'light'].includes(savedBg)) {
            setBgName(savedBg);
        }
    }, []);

    const setTheme = (name: ThemeColor) => {
        setThemeName(name);
        localStorage.setItem('focus-buddy-theme', name);
    };

    const setBg = (name: ThemeBg) => {
        setBgName(name);
        localStorage.setItem('focus-buddy-bg', name);
    };

    // Calculate dynamic UI theme colors based on bgName
    const ui = {
        bg: bgName === 'light' ? 'bg-neutral-300/95' : 'bg-neutral-900/95',
        text: bgName === 'light' ? 'text-neutral-800' : 'text-white',
        textMuted: bgName === 'light' ? 'text-neutral-600' : 'text-white/50',
        modal: bgName === 'light' ? 'bg-neutral-200' : 'bg-neutral-900',
        modalBgHover: bgName === 'light' ? 'hover:bg-black/10' : 'hover:bg-white/10',
        border: bgName === 'light' ? 'border-neutral-400' : 'border-white/10',
        inputBg: bgName === 'light' ? 'bg-black/10' : 'bg-black/40',
        headerIconBase: bgName === 'light' ? 'text-neutral-500' : 'text-white/30',
        headerIconHover: bgName === 'light' ? 'hover:text-neutral-900' : 'hover:text-white',
        headerIconActive: bgName === 'light' ? 'text-neutral-900' : 'text-white',
        resetBg: bgName === 'light' ? 'bg-neutral-400' : 'bg-gray-700',
        resetText: bgName === 'light' ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/70 hover:text-white',
        cardBg: bgName === 'light' ? 'bg-black/20' : 'bg-white/5',
        cardHoverBg: bgName === 'light' ? 'hover:bg-black/30' : 'hover:bg-white/10',
        modalFooter: bgName === 'light' ? 'from-neutral-200 via-neutral-200/90' : 'from-neutral-900 via-neutral-900/90',
    };

    return {
        themeName,
        theme: THEMES[themeName],
        setTheme,
        bgName,
        setBg,
        ui
    };
}
