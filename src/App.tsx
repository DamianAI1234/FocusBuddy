import { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { useTimer } from './hooks/useTimer';
import { Alert, getAllRules } from './core/ProductivityEngine';
import { Onboarding } from './components/Onboarding';
import { X, Minimize2, Power, Settings as SettingsIcon, Check, Moon, MoonStar, ListTodo, Zap } from 'lucide-react';
import { useTheme, THEMES, ThemeColor } from './hooks/useTheme';

// IPC for Electron window controls
// @ts-ignore
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: { send: () => { } } };

function App() {
    const {
        displaySeconds, isRunning, start, pause, reset, alerts, clearAlert,
        mode, setMode, setDuration, duration,
        enabledRules, setEnabledRules
    } = useTimer();

    const [dndEnabled, setDndEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showReminders, setShowReminders] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('focus-buddy-onboarded'));
    const [isEditingDuration, setIsEditingDuration] = useState(false);
    const [customDurationInput, setCustomDurationInput] = useState('');
    const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
    const allRules = getAllRules();

    const { themeName, theme, setTheme, bgName, setBg, ui } = useTheme();

    // Toggle DND based on timer state
    useEffect(() => {
        if (dndEnabled) {
            if (isRunning) {
                ipcRenderer.send('set-dnd', 1);
            } else {
                ipcRenderer.send('set-dnd', 0);
            }
        } else {
            ipcRenderer.send('set-dnd', 0);
        }
        return () => { };
    }, [isRunning, dndEnabled]);

    // Robust hook that automatically scrolls to a highlighted rule whenever it's set
    // AND the reminders view is fully mounted onto the DOM.
    useEffect(() => {
        if (!showReminders || !highlightedRuleId) return;

        let attempts = 0;
        const intervalId = setInterval(() => {
            const container = document.getElementById('reminders-scroll-container');
            const el = document.getElementById(`rule-${highlightedRuleId}`);

            if (container && el) {
                // Ensure layout has happened
                if (el.offsetTop > 0 || highlightedRuleId === allRules[0]?.id) {
                    // Mathematically scroll the container relative to its own space,
                    // immune to CSS slide-in transform visual bugs.
                    container.scrollTo({
                        top: el.offsetTop - 100, // Offset a bit so it's not hugging the top edge
                        behavior: 'smooth'
                    });
                    clearInterval(intervalId);
                }
            }

            if (attempts > 15) {
                clearInterval(intervalId); // Give up if it never mounts (~1.5s)
            }
            attempts++;
        }, 50);

        // Clear the highlight styling after a few seconds
        const clearTimer = setTimeout(() => setHighlightedRuleId(null), 3000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(clearTimer);
        };
    }, [showReminders, highlightedRuleId]);

    // Handle clicks from the external Notification Window
    useEffect(() => {
        const handleOpenReminders = (_e: any, ruleId?: string) => {
            if (ruleId) {
                setHighlightedRuleId(ruleId);
                setShowReminders(true);
            }
        };
        ipcRenderer.on('open-reminders-view', handleOpenReminders);
        return () => {
            ipcRenderer.off('open-reminders-view', handleOpenReminders);
        };
    }, []);

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'custom') {
            setIsEditingDuration(true);
            setCustomDurationInput(Math.floor(duration / 60).toString());
        } else {
            setDuration(parseInt(val) * 60);
        }
    };

    const submitCustomDuration = () => {
        const mins = parseInt(customDurationInput);
        if (!isNaN(mins) && mins > 0) {
            setDuration(mins * 60);
        }
        setIsEditingDuration(false);
    };



    const toggleRule = (ruleId: string, e?: React.MouseEvent) => {
        // Prevent toggle if clicking the dropdown
        if (e && (e.target as HTMLElement).tagName.toLowerCase() === 'select') return;

        setEnabledRules(prev => {
            const current = (prev as Record<string, any>)[ruleId] || { isEnabled: false, intervalIndex: allRules.find(r => r.id === ruleId)?.defaultIntervalIndex || 0 };
            const updated = {
                ...prev,
                [ruleId]: { ...current, isEnabled: !current.isEnabled }
            };
            localStorage.setItem('focus-buddy-rules', JSON.stringify(updated));
            return updated;
        });
    };

    const updateRuleInterval = (ruleId: string, intervalIndex: number) => {
        setEnabledRules(prev => {
            const current = (prev as Record<string, any>)[ruleId] || { isEnabled: false, intervalIndex: 0 };
            const updated = {
                ...prev,
                [ruleId]: { ...current, intervalIndex }
            };
            localStorage.setItem('focus-buddy-rules', JSON.stringify(updated));
            return updated;
        });
    };

    const closeApp = () => ipcRenderer.send('close-app');
    const minimizeApp = () => ipcRenderer.send('minimize-app');

    const renderRemindersView = () => (
        <div className={`absolute inset-0 z-50 w-full h-full ${ui.modal} flex flex-col no-drag animate-in slide-in-from-right`}>
            <div className={`flex-none p-4 border-b ${ui.border} flex justify-between items-center bg-transparent backdrop-blur-md z-10`}>
                <span className={`font-bold text-sm tracking-wider uppercase ${ui.text}`}>Activity Reminders</span>
                <button onClick={() => setShowReminders(false)} className={`${ui.inputBg} ${ui.modalBgHover} p-1.5 rounded-full transition-colors ${ui.text}`}><X size={16} /></button>
            </div>

            <div id="reminders-scroll-container" className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide pb-24 relative">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Reminders</h3>
                    <span className="text-[10px] text-white/30">{Object.values(enabledRules).filter(r => (r as any).isEnabled).length} Active</span>
                </div>

                <div className="space-y-3">
                    {allRules.map(rule => {
                        const activeConfig = (enabledRules as Record<string, any>)[rule.id];
                        const isActive = activeConfig?.isEnabled;
                        const currentIntervalIndex = activeConfig ? activeConfig.intervalIndex : rule.defaultIntervalIndex;

                        return (
                            <div
                                key={rule.id}
                                id={`rule-${rule.id}`}
                                onClick={() => toggleRule(rule.id)}
                                className={`relative p-3 rounded-xl border transition-all duration-500 cursor-pointer overflow-hidden ${isActive ? `border-transparent` : `bg-transparent ${ui.border} ${ui.cardHoverBg}`} ${highlightedRuleId === rule.id ? `ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-[1.02] bg-white/10` : ''}`}
                            >
                                {/* Glowing Background Effect for Active State */}
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 opacity-[0.15] z-0" style={{ backgroundColor: theme.hex }}></div>
                                        <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none z-10 ${theme.borderClass} opacity-50`}></div>
                                    </>
                                )}

                                <div className="relative z-20">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm transition-colors ${isActive ? theme.textClass : ui.textMuted}`}>{rule.message}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ml-2 ${isActive ? `${theme.bgClass} text-white shadow-md scale-100` : 'bg-white/5 text-transparent scale-[0.85]'}`}>
                                            <Check size={12} strokeWidth={3} className={isActive ? "opacity-100" : "opacity-0"} />
                                        </div>
                                    </div>
                                    <p className={`text-[10.5px] leading-relaxed ${ui.textMuted} mb-2 pr-4`}>{rule.description}</p>

                                    {/* Interval Selector Buttons */}
                                    <div className="flex gap-2 font-mono text-[10px] w-full mt-2" onClick={e => e.stopPropagation()}>
                                        {rule.intervals.map((interval, i) => {
                                            const isSelected = currentIntervalIndex === i;
                                            const shortLabel = interval.label.replace('Every ', '');
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateRuleInterval(rule.id, i);
                                                    }}
                                                    style={{ backgroundColor: isSelected ? theme.hex : undefined, color: isSelected ? '#fff' : undefined }}
                                                    className={`flex-1 py-1.5 rounded-md border transition-colors flex items-center justify-center ${isSelected
                                                        ? `border-transparent shadow font-medium`
                                                        : `${isActive ? ui.inputBg : 'bg-transparent'} ${ui.border} ${isActive ? 'text-white font-medium drop-shadow-md' : ui.textMuted} hover:opacity-80`
                                                        }`}
                                                >
                                                    {shortLabel}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fixed Footer */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${ui.modalFooter} to-transparent pointer-events-none flex justify-center z-20`}>
                <button onClick={() => setShowReminders(false)} className="pointer-events-auto px-8 py-2.5 bg-white text-black hover:bg-white/90 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-xl active:scale-95">
                    Done
                </button>
            </div>
        </div>
    );

    const renderSettingsView = () => (
        <div className={`absolute inset-0 z-50 w-full h-full ${ui.modal} flex flex-col no-drag animate-in slide-in-from-right`}>
            <div className={`flex-none p-4 border-b ${ui.border} flex justify-between items-center bg-transparent backdrop-blur-md z-10`}>
                <span className={`font-bold text-sm tracking-wider uppercase ${ui.text}`}>Appearance</span>
                <button onClick={() => setShowSettings(false)} className={`${ui.inputBg} ${ui.modalBgHover} p-1.5 rounded-full transition-colors ${ui.text}`}><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide pb-24">
                <div>
                    <h3 className={`text-xs font-bold ${ui.textMuted} uppercase tracking-widest mb-3`}>Accent Color</h3>
                    <div className="flex gap-3 flex-wrap">
                        {(Object.keys(THEMES) as ThemeColor[]).map((key) => {
                            const t = THEMES[key];
                            const isActive = themeName === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setTheme(key)}
                                    className={`relative w-12 h-12 rounded-xl transition-all duration-200 border-2 overflow-hidden flex items-center justify-center ${isActive ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                    title={t.label}
                                >
                                    <div className="absolute inset-0" style={{ backgroundColor: t.hex }}></div>
                                    {isActive && <Check size={18} className="relative z-10 text-white drop-shadow-md" />}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-0"></div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className={`text-xs font-bold ${ui.textMuted} uppercase tracking-widest mb-3`}>Interface Background</h3>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => setBg('dark')}
                            style={{ backgroundColor: bgName === 'dark' ? `${theme.hex}1A` : undefined }}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${bgName === 'dark' ? `${theme.borderClass} ${theme.textClass}` : `${ui.inputBg} ${ui.border} hover:opacity-80`}`}
                        >
                            <span className="font-medium">Dark</span>
                            {bgName === 'dark' && <Check size={16} />}
                        </button>
                        <button
                            onClick={() => setBg('light')}
                            style={{ backgroundColor: bgName === 'light' ? `${theme.hex}33` : undefined }}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${bgName === 'light' ? `${theme.borderClass} text-neutral-900` : `${ui.inputBg} ${ui.border} hover:opacity-80`}`}
                        >
                            <span className="font-medium">Light</span>
                            {bgName === 'light' && <Check size={16} className="text-neutral-900" />}
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-2">
                    <button
                        onClick={() => {
                            setShowSettings(false);
                            setShowOnboarding(true);
                        }}
                        className={`w-full p-4 rounded-xl border border-dashed transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 ${ui.inputBg} ${ui.border} hover:opacity-80 ${theme.textClass}`}
                    >
                        <MoonStar size={16} />
                        Replay Onboarding Tour
                    </button>
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t ${ui.modalFooter} to-transparent pointer-events-none flex justify-center z-20`}>
                <button onClick={() => setShowSettings(false)} className="pointer-events-auto px-8 py-2.5 bg-white text-black hover:bg-white/90 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-xl active:scale-95">
                    Done
                </button>
            </div>
        </div>
    );

    const renderTimerView = () => (
        <div className="z-0 flex flex-col items-center w-full px-6 animate-in slide-in-from-left">
            <div className="flex gap-2 mb-4 no-drag pointer-events-auto items-center flex-wrap justify-center w-full">
                <div className={`flex ${ui.inputBg} rounded-lg p-1`}>
                    <button
                        onClick={() => setMode('timer')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all ${mode === 'timer' ? `${theme.bgClass} text-white shadow-sm` : `${ui.textMuted} ${ui.headerIconHover}`}`}
                    >
                        Timer
                    </button>
                    <button
                        onClick={() => setMode('stopwatch')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all ${mode === 'stopwatch' ? `${theme.bgClass} text-white shadow-sm` : `${ui.textMuted} ${ui.headerIconHover}`}`}
                    >
                        Stopwatch
                    </button>
                </div>
            </div>

            {mode === 'timer' && !isRunning && (
                <div className="mb-4 no-drag pointer-events-auto">
                    {isEditingDuration ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                autoFocus
                                className={`${ui.inputBg} ${ui.text} text-sm rounded-lg border ${theme.borderClass} px-3 py-1 w-20 text-center focus:outline-none`}
                                value={customDurationInput}
                                onChange={(e) => setCustomDurationInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitCustomDuration()}
                                onBlur={submitCustomDuration}
                            />
                            <span className={`text-xs ${ui.textMuted}`}>min</span>
                        </div>
                    ) : (
                        <select
                            className={`${ui.inputBg} ${ui.text} text-sm rounded-lg border flex-none ${ui.border} px-3 py-1 focus:outline-none focus:${theme.borderClass} ${ui.modalBgHover} transition-colors cursor-pointer appearance-none`}
                            onChange={handlePresetChange}
                            value={Math.floor(duration / 60)}
                        >
                            <option className={`${ui.modal} ${ui.text}`} value="15">15 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="25">25 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="30">30 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="45">45 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="60">60 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="90">90 min</option>
                            <option className={`${ui.modal} ${ui.text}`} value="custom">Custom...</option>
                        </select>
                    )}
                </div>
            )}

            <div id="focus-timer-area" className={`transition-all duration-500 ${isRunning ? 'scale-125 my-8' : 'scale-100 my-2 opacity-90'}`}>
                <Timer seconds={displaySeconds} mode={mode} isRunning={isRunning} onDurationChange={setDuration} themeClass={theme.textClass} />
            </div>

            <div className="no-drag mt-2">
                <Controls
                    isRunning={isRunning}
                    onStart={start}
                    onPause={pause}
                    onReset={reset}
                    themeClass={{ bg: theme.bgClass, shadow: theme.shadowClass }}
                    resetTheme={{ bg: ui.resetBg, text: ui.resetText }}
                />
            </div>
        </div>
    );

    return (
        <div className={`relative flex flex-col items-center justify-center min-h-screen ${ui.bg} ${ui.text} overflow-hidden select-none drag-region border ${ui.border} rounded-3xl backdrop-blur-xl transition-all`}>
            {/* Title / Header */}
            <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-center no-drag z-10 w-full overflow-hidden shrink-0`}>
                <div className={`text-[10px] font-bold ${ui.textMuted} uppercase tracking-widest pl-2 truncate w-full pr-4 pb-0.5`} title="Focus Buddy">Focus Buddy</div>
                <div className="flex gap-2">
                    <button id="btn-dnd" onClick={() => setDndEnabled(!dndEnabled)} className={`transition-colors p-1 flex items-center gap-1 ${dndEnabled ? 'text-purple-500' : `${ui.headerIconBase} ${ui.headerIconHover}`}`} title="Focus Assist (DND)">
                        {dndEnabled ? <MoonStar size={14} /> : <Moon size={14} />}
                    </button>
                    <button id="btn-reminders" onClick={() => setShowReminders(!showReminders)} className={`transition-colors p-1 ${showReminders ? ui.headerIconActive : `${ui.headerIconBase} ${ui.headerIconHover}`}`} title="Activity Reminders"><ListTodo size={14} /></button>
                    <button id="btn-settings" onClick={() => setShowSettings(!showSettings)} className={`transition-colors p-1 ${showSettings ? ui.headerIconActive : `${ui.headerIconBase} ${ui.headerIconHover}`}`} title="Appearance"><SettingsIcon size={14} /></button>
                    <button id="btn-minimize" onClick={minimizeApp} className={`${ui.headerIconBase} ${ui.headerIconHover} transition-colors p-1`} title="Minimize"><Minimize2 size={14} /></button>
                    <button id="btn-close" onClick={closeApp} className={`${ui.headerIconBase} hover:text-red-500 transition-colors p-1`} title="Close"><Power size={14} /></button>
                </div>
            </div>

            {/* Views */}
            {showSettings ? renderSettingsView() : showReminders ? renderRemindersView() : renderTimerView()}

            {/* Alerts Overlay / Toast */}
            <div className="absolute bottom-4 left-0 right-0 px-4 flex flex-col gap-2 pointer-events-none z-30">
                {alerts.map((alert: Alert) => (
                    <div
                        key={alert.id}
                        onClick={() => {
                            clearAlert(alert.id);
                            setHighlightedRuleId(alert.id);
                            setShowReminders(true);
                        }}
                        className={`pointer-events-auto no-drag rounded-xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl overflow-hidden cursor-pointer hover:bg-black/70 transition-all animate-in slide-in-from-bottom flex items-center p-2.5 gap-3 group`}
                    >
                        {/* App / Category Icon */}
                        <div style={{ backgroundColor: theme.hex }} className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 shadow-inner">
                            <Zap size={14} className="text-white drop-shadow-md" />
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">
                                    Activity
                                </span>
                            </div>
                            <h4 className="text-xs font-semibold text-white truncate drop-shadow-sm">{alert.message}</h4>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearAlert(alert.id);
                            }}
                            className={`p-1.5 rounded-full bg-white/5 hover:bg-white/20 text-white/40 hover:text-white transition-colors cursor-default`}
                        >
                            <X size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Application Onboarding */}
            {showOnboarding && (
                <Onboarding
                    ui={ui}
                    onComplete={() => {
                        localStorage.setItem('focus-buddy-onboarded', 'true');
                        setShowOnboarding(false);
                    }}
                />
            )}

            {/* Background Ambient Glow */}
            <div className={`absolute -z-10 w-full h-full rounded-full blur-3xl transition-opacity duration-1000 ${isRunning ? 'opacity-100 animate-pulse' : 'opacity-0'}`} style={{ backgroundColor: `${theme.hex}0D` }}></div>
        </div>
    );
}

export default App;
