"use strict";

declare const __static: string;
import Watcher from "@/backend/Watcher";
import { Music } from "@/schema";
import chokidar from "chokidar";
import dataurl from "dataurl";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Notification,
  protocol
} from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import fs from "fs";
import NodeID3 from "node-id3";
import path from "path";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
// import { seekMusic } from "./providers/MusicScanner";
import { BackEndListeners, FrontEndListeners, UNKNOWN } from "./schema/Enums";
import { calcHash } from "./backend/utils";
import Favorites from "./backend/DataBasa/Favorites";
import { remove } from "lodash";
import Composer from "./backend/Composer";

const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1020,
    height: 600,
    show: false,
    frame: false,
    // transparent: true,
    webPreferences: {
      webSecurity: false,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true
    }
  });

  win.webContents.on("did-finish-load", function () {
    win.show();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// // CREATE DATABASE FOLDERS

// IPC MAIN Listeners

ipcMain.on(
  "convert-to-data-url",
  (event, arg: { data: string; mime: string }) => {
    const x = dataurl.convert({ data: arg.data, mimetype: arg.mime });
    // const data = readFileSync(arg.data)
    event.returnValue = x;
  }
);

ipcMain.on("add-new-lib.req", event => {
  const res = dialog.showOpenDialogSync({ properties: ["openDirectory"] });
  if (res) {
    event.reply("add-new-lib.res", res[0]);
  }
});

// INDEX MUSICS MECHANISM


// GLOBALS
global.questUserData = app.getPath("userData");

if (!fs.existsSync(path.join(app.getPath("userData"), "database"))) {
  fs.mkdirSync(path.join(app.getPath("userData"), "database"));
}

ipcMain.on("close-appication", () => {
  // ImageManager.dump()
  const NOTIFICATION_TITLE = "Basic Notification";
  const NOTIFICATION_BODY = "See you soon buddy";

  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY
  }).show();

  app.quit();
});

ipcMain.on("minimize-appication", () => {
  BrowserWindow.getAllWindows()[0].minimize();
});

async function startBuildingDatabase(absPath: string[]) {
  console.log("START BUILDING DATABASE");

  const musicObjects = Composer.seek(absPath);

  // const r =
  const musics = Composer.compose(musicObjects, { isDirectory: true, library: "" })

  const data = await Promise.allSettled(musics)

  const fulfilled: Music[] = []

  data.forEach(
    (res) => {
      if (res.status === "fulfilled")
        fulfilled.push(res.value)
    })

  BrowserWindow.getAllWindows()[0].webContents.send(
    FrontEndListeners.addToLibrary,
    fulfilled
  );

  // const response = data.filter(
  //   res => res.status === "fulfilled"
  // ) as PromiseFulfilledResult<Music[]>//.map(i => i.value);

  // as PromiseFulfilledResult<Music[]>;
  // .forEach(async music => {
  //   const m = await music;

  //   BrowserWindow.getAllWindows()[0].webContents.send(
  //     FrontEndListeners.addToLibrary,
  //     m
  //   );
  // });
}

ipcMain.on(BackEndListeners.start, (_, libs: string[]) => {
  main(libs);
});

ipcMain.on(BackEndListeners.buildDatabase, (_, libs: string[]) => {
  // send
  BrowserWindow.getAllWindows()[0].webContents.send(
    FrontEndListeners.dumpLibrary
  );
  startBuildingDatabase(libs);
});

async function main(libs: string[]) {
  console.log("backend starts here width", libs);
  startBuildingDatabase(libs);

  // starts here
  new Watcher(libs);
}
