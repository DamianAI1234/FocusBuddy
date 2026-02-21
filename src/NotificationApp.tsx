import { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { X, Zap, Trophy } from 'lucide-react';

export function NotificationApp() {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('reminder');
    const [ruleId, setRuleId] = useState('');

    useEffect(() => {
        const { ipcRenderer } = window.require('electron');
        const handleNotification = (_e: any, args: { title: string; message: string; type: string, ruleId?: string }) => {
            setTitle(args.title);
            setMessage(args.message);
            setType(args.type || 'reminder');
            setRuleId(args.ruleId || '');
        };
        ipcRenderer.on('show-notification-data', handleNotification);
        return () => {
            ipcRenderer.off('show-notification-data', handleNotification);
        };
    }, []);

    const closeHandler = () => {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('close-notification');
    };

    return (
        <div className="w-full h-full p-3 flex items-center justify-center pointer-events-none">
            {/* Main Mac-style floating card container */}
            <div
                onClick={() => {
                    const { ipcRenderer } = window.require('electron');
                    ipcRenderer.send('open-reminders-view', ruleId);
                    closeHandler();
                }}
                className={`w-full rounded-[20px] border border-white/10 bg-black/60 shadow-2xl backdrop-blur-3xl overflow-hidden pointer-events-auto no-drag select-none animate-in fade-in slide-in-from-right-8 duration-300 cursor-pointer`}
            >
                <div className="p-4 flex gap-4 items-start relative">

                    {/* App / Category Icon */}
                    <div style={{ backgroundColor: theme.hex }} className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 shadow-inner">
                        {type === 'timer' ? <Trophy size={20} className="text-white drop-shadow-md" /> : <Zap size={20} className="text-white drop-shadow-md" />}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                {type === 'timer' ? 'Focus Session' : 'Activity'}
                            </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate drop-shadow-sm">{title || "Focus Buddy"}</h4>
                        <p className="text-xs mt-1 leading-relaxed text-white/80 line-clamp-2">{message || "Notification"}</p>
                    </div>

                    {/* Minimalist Close Button */}
                    <div className="absolute top-3.5 right-3.5 flex flex-col items-center">
                        <button
                            onClick={closeHandler}
                            className={`p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white no-drag transition-colors group cursor-default`}
                        >
                            <X size={14} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationApp;
