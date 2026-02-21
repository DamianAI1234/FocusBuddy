const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { setFocusAssist } = require('./focus-assist');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 550,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,       // Frameless for widget look
        transparent: true,  // Transparent background
        alwaysOnTop: true,  // Float above other windows
        resizable: false,   // Fixed size widget
        skipTaskbar: false,
        icon: path.join(__dirname, '../public/vite.svg'),
        show: false // Wait until ready to avoid flicker
    });

    const isDev = process.env.NODE_ENV === 'development'; // Simplified check

    mainWindow.loadURL(
        'http://localhost:5173'
    ).catch(e => {
        console.log('Failed to load local dev server, trying file...');
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Open the DevTools so we can see if there are React errors
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.on('closed', () => (mainWindow = null));
}

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
ipcMain.on('minimize-app', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-app', () => {
    // Ensure DND is off when closing
    setFocusAssist(0);
    if (mainWindow) mainWindow.close();
});

ipcMain.on('set-dnd', (event, mode) => {
    // Mode: 0=Off, 1=Priority, 2=Alarms
    setFocusAssist(mode);
});
