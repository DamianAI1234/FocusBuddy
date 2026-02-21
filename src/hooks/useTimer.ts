import { useState, useEffect, useRef } from 'react';
import { checkAlerts, Alert } from '../core/ProductivityEngine';

// @ts-ignore
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: { send: () => { } } };

export type TimerMode = 'stopwatch' | 'timer';

export function useTimer() {
    const [mode, setMode] = useState<TimerMode>('timer');
    const [duration, setDuration] = useState(25 * 60); // Default 25m for timer
    const [elapsed, setElapsed] = useState(0);
    const [timeLeft, setTimeLeft] = useState(25 * 60);

    const [isRunning, setIsRunning] = useState(false);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [, setSessionTime] = useState(0);

    // Initialize enabled rules with an optimized default subset
    const [enabledRules, setEnabledRules] = useState<Record<string, { isEnabled: boolean, intervalIndex: number }>>({
        'posture-check': { isEnabled: true, intervalIndex: 1 },
        'water-break': { isEnabled: true, intervalIndex: 1 },
        'screen-distance': { isEnabled: true, intervalIndex: 0 },
        'stretch-break': { isEnabled: true, intervalIndex: 2 },
        'single-task-check': { isEnabled: true, intervalIndex: 1 }
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                // Update session time for alerts regardless of mode
                setSessionTime(prev => {
                    const newSessionTime = prev + 1;
                    // Pass enabledRules to checkAlerts
                    const newAlerts = checkAlerts(newSessionTime, enabledRules);
                    if (newAlerts.length > 0) {
                        setAlerts(cur => [...cur, ...newAlerts]);
                        // Trigger custom system notification
                        newAlerts.forEach(alert => {
                            ipcRenderer.send('show-custom-notification', {
                                title: alert.message,
                                message: alert.description,
                                type: 'reminder',
                                ruleId: alert.id
                            });
                        });
                    }
                    return newSessionTime;
                });

                if (mode === 'stopwatch') {
                    setElapsed(prev => prev + 1);
                } else {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            setIsRunning(false);
                            ipcRenderer.send('show-custom-notification', {
                                title: "Focus Timer Complete",
                                message: "Great focus session! Take a well-deserved break.",
                                type: 'timer'
                            });
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode]);

    const start = () => setIsRunning(true);
    const pause = () => setIsRunning(false);
    const reset = () => {
        setIsRunning(false);
        setElapsed(0);
        setSessionTime(0);
        if (mode === 'timer') {
            setTimeLeft(duration);
        }
        setAlerts([]);
    };

    const setTimerValid = (seconds: number) => {
        setDuration(seconds);
        setTimeLeft(seconds);
        setElapsed(0);
        setSessionTime(0);
        setIsRunning(false);
    }

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        reset();
    }

    const clearAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const displaySeconds = mode === 'stopwatch' ? elapsed : timeLeft;

    return {
        displaySeconds,
        isRunning,
        start,
        pause,
        reset,
        alerts,
        clearAlert,
        mode,
        setMode: switchMode,
        setDuration: setTimerValid,
        duration,
        enabledRules,
        setEnabledRules
    };
}
