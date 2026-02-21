import { useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { X, Bell } from 'lucide-react';

export function NotificationApp() {
    const { theme, ui } = useTheme();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const { ipcRenderer } = window.require('electron');
        const handleNotification = (_e: any, args: { title: string; message: string }) => {
            setTitle(args.title);
            setMessage(args.message);
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
        <div className={`w-full h-full flex flex-col justify-center rounded-2xl border ${ui.border} ${ui.modal} shadow-2xl backdrop-blur-xl overflow-hidden pointer-events-auto drag-region select-none animate-in fade-in slide-in-from-right`}>
            <div className={`p-4 flex gap-3 items-start relative`}>
                <div style={{ backgroundColor: `${theme.hex}33` }} className="p-2 rounded-xl flex-shrink-0">
                    <Bell size={20} className={theme.textClass} />
                </div>

                <div className="flex-1 min-w-0 pr-6 mt-0.5">
                    <h4 className={`text-sm font-semibold truncate ${ui.text}`}>{title || "Focus Buddy"}</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${ui.textMuted} line-clamp-2`}>{message || "Notification"}</p>
                </div>

                <button
                    onClick={closeHandler}
                    className={`absolute top-3 right-3 p-1 rounded-full bg-transparent ${ui.headerIconHover} ${ui.textMuted} no-drag transition-colors`}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

export default NotificationApp;
