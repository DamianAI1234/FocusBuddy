"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var mainWindow = null;
var notificationWindow = null;
var notificationTimeout = null;
var createWindow = () => {
  const { width, height } = import_electron.screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new import_electron.BrowserWindow({
    icon: import_path.default.join(__dirname, "../public/icon.png"),
    width: 300,
    height: 450,
    x: width - 320,
    y: height - 500,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
      // For simple prototype, can be secured later
    },
    frame: false,
    // Widget style
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173/");
  } else {
    mainWindow.loadFile(import_path.default.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
import_electron.app.on("ready", createWindow);
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
import_electron.ipcMain.on("toggle-always-on-top", (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
});
import_electron.ipcMain.on("minimize-app", () => {
  mainWindow?.minimize();
});
import_electron.ipcMain.on("close-app", () => {
  mainWindow?.close();
});
import_electron.ipcMain.on("show-custom-notification", (event, { title, message, type, ruleId }) => {
  const { width, height } = import_electron.screen.getPrimaryDisplay().workAreaSize;
  if (!notificationWindow) {
    notificationWindow = new import_electron.BrowserWindow({
      icon: import_path.default.join(__dirname, "../public/icon.png"),
      width: 380,
      height: 120,
      x: width - 400,
      y: 40,
      // Top right corner
      webPreferences: {
        preload: import_path.default.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      hasShadow: false,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      focusable: false,
      show: false
    });
    if (process.env.NODE_ENV === "development") {
      notificationWindow.loadURL(`http://localhost:5173/#/notification`);
    } else {
      notificationWindow.loadFile(import_path.default.join(__dirname, "../dist/index.html"), { hash: "notification" });
    }
    notificationWindow.on("closed", () => {
      notificationWindow = null;
    });
    notificationWindow.setAlwaysOnTop(true, "screen-saver");
  }
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationWindow.once("ready-to-show", () => {
    notificationWindow?.showInactive();
    notificationWindow?.webContents.send("show-notification-data", { title, message, type, ruleId });
    notificationTimeout = setTimeout(() => {
      if (notificationWindow) {
        notificationWindow.close();
      }
    }, 15e3);
  });
  if (notificationWindow.isVisible() || notificationWindow.webContents.isLoading() === false) {
    notificationWindow.showInactive();
    notificationWindow.webContents.send("show-notification-data", { title, message, type, ruleId });
    notificationTimeout = setTimeout(() => {
      if (notificationWindow) {
        notificationWindow.close();
      }
    }, 15e3);
  }
});
import_electron.ipcMain.on("open-reminders-view", (event, ruleId) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("open-reminders-view", ruleId);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
  }
});
import_electron.ipcMain.on("close-notification", () => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }
  if (notificationWindow) {
    notificationWindow.close();
  }
});
