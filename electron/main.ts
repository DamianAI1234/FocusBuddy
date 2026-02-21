import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';

// Removed Windows-specific Squirrel startup logic for cross-platform macOS compatibility

let mainWindow: BrowserWindow | null = null;
let notificationWindow: BrowserWindow | null = null;
let notificationTimeout: NodeJS.Timeout | null = null;

const createWindow = () => {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 300,
        height: 450,
        x: width - 320,
        y: height - 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false, // For simple prototype, can be secured later
        },
        frame: false, // Widget style
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        skipTaskbar: false,
    });

    // Load the index.html of the app.
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers
ipcMain.on('toggle-always-on-top', (event, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
    }
});

ipcMain.on('minimize-app', () => {
    mainWindow?.minimize();
});

ipcMain.on('close-app', () => {
    mainWindow?.close();
});

ipcMain.on('show-custom-notification', (event, { title, message }) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    if (!notificationWindow) {
        notificationWindow = new BrowserWindow({
            width: 320,
            height: 100,
            x: width - 340,
            y: 40, // Top right corner
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: false,
            },
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            resizable: false,
            skipTaskbar: true,
            focusable: false,
            show: false,
        });

        if (process.env.VITE_DEV_SERVER_URL) {
            notificationWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/notification`);
        } else {
            notificationWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'notification' });
        }

        notificationWindow.on('closed', () => {
            notificationWindow = null;
        });
    }

    // Clear any existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    notificationWindow.once('ready-to-show', () => {
        notificationWindow?.showInactive();
        notificationWindow?.webContents.send('show-notification-data', { title, message });

        // Auto close after 15 seconds
        notificationTimeout = setTimeout(() => {
            if (notificationWindow) {
                notificationWindow.close();
            }
        }, 15000);
    });

    // If it's already created and just hidden/shown
    if (notificationWindow.isVisible() || notificationWindow.webContents.isLoading() === false) {
        notificationWindow.showInactive();
        notificationWindow.webContents.send('show-notification-data', { title, message });

        notificationTimeout = setTimeout(() => {
            if (notificationWindow) {
                notificationWindow.close();
            }
        }, 15000);
    }
});

ipcMain.on('close-notification', () => {
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    if (notificationWindow) {
        notificationWindow.close();
    }
});
