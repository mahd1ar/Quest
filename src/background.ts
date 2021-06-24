"use strict";

import chokidar from "chokidar";
import { Music } from "@/schema";
import dataurl from "dataurl";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
  session
} from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import fs from "fs";
import { flattenDeep } from "lodash";
import NodeID3 from "node-id3";
import path from "path";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { RecentlyAddedBuilder, Shadows, Category, Favorites } from "./database";
import { areDiffrent } from "./helpers";
import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "./providers/constants";
import { MainQueue, Task } from "./providers/utilities";
import { seekMusic } from "./providers/MusicScanner";
import { initRoutes } from "./endpoints";

const isDevelopment = process.env.NODE_ENV !== "production";
// main queue

const questQueue = new MainQueue();

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
    // transparent:true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true
    }
  });

  win.webContents.on("did-finish-load", function() {
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

  // const filter = {
  //   urls: ['*://*.google.com/*']
  // };

  // session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  //   console.log("rh:", details.requestHeaders['Origin'])
  //   details.requestHeaders['Origin'] = 'https://quest-backend.vercel.app';
  //   details.headers['Origin'] = 'https://quest-backend.vercel.app';
  //   callback({ requestHeaders: details.requestHeaders })
  // });
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
  fs.mkdirSync(path.join(app.getPath("userData"), "database/indexes"));
}
const watcherInstance: chokidar.FSWatcher[] = [];

ipcMain.on("close-appication", () => {
  app.quit();
});

ipcMain.on("minimize-appication", () => {
  BrowserWindow.getAllWindows()[0].minimize();
});

function startBuildingDatabase(absPath: string[]) {
  console.log("START BUILDING DATABASE");
  const albums = new Category("album");
  const artist = new Category("artist");
  const folder = new Category("library");
  const favorite = new Favorites();
  const shadow = new Shadows();

  const recentlyAdded = new RecentlyAddedBuilder();

  shadow.dump();
  albums.dump();
  artist.dump();
  folder.dump();
  recentlyAdded.dump();

  shadow.createDirectory();

  const musicObjects = seekMusic(absPath);

  musicObjects.forEach((shade, inx: number) => {
    new Task(questQueue, async task => {
      const musicTags = await NodeID3.Promise.read(shade.fullpath);

      const music: Music = {
        id: shade.id,
        album: musicTags.album || UNKNOWN_ALBUM,
        artist: musicTags.artist || UNKNOWN_ARTIST,
        fullpath: path.join(shade.fullpath),
        library: shade.library,
        modified: shade.modified,
        name: shade.name,
        title: musicTags.title || shade.name.replace(".mp3", ""),
        favorite: false
      };

      favorite.write(music, musicObjects.length === inx + 1);
      albums.write(music, musicObjects.length === inx + 1);
      artist.write(music, musicObjects.length === inx + 1);
      folder.write(music, musicObjects.length === inx + 1);
      shadow.write(music);

      recentlyAdded.write(music, musicObjects.length === inx + 1);

      task.done();
    }).ready();
  });

  console.log("end of start building database");
}

function compair(entryPints: string[]): boolean {
  const folders = new Category("library");

  if (areDiffrent(folders.ls(), entryPints)) {
    return true;
  }
  const shadow = new Shadows();
  if (!shadow.existSync()) {
    return true;
  }

  // compaire contents
  const c = folders.ls().map(libFolderName => {
    const f = new Category("library", libFolderName);

    const musicsids = f.get().map(id => f.getShadow(id).fullpath);

    const musicList = seekMusic(libFolderName).map(i => i.fullpath);

    return areDiffrent(musicList, musicsids);
  });

  return flattenDeep(c).some(Boolean);
}

function watchForChange(path: string, calback: Function): chokidar.FSWatcher {
  return chokidar
    .watch(path, {
      //   depth: 0,
      ignoreInitial: true,
      awaitWriteFinish: true
    })
    .on("all", event => {
      if (["unlinkDir", "addDir"].includes(event)) {
        console.log("EVENT IGNORED");
        return;
      }
      console.log("event fired!!", event);
      calback(event);
    });
}

function watchAndIndex(libraries: string[]) {
  console.log("watch and index");
  // rebuild
  startBuildingDatabase(libraries);

  watcherInstance.forEach(watchre => watchre.close());
  watcherInstance.splice(0, watcherInstance.length);

  BrowserWindow.getAllWindows()[0].webContents.send("DB-Changed.res");

  libraries.forEach(lib => {
    const w = watchForChange(lib, () => {
      watchAndIndex(libraries);
    });
    watcherInstance.push(w);
  });
}

// entry point
function start(libraries: string[]) {
  const startJob = new Task(questQueue, task => {
    console.log({ libraries });
    // FOR NOW
    // if (libraries.length === 0) {
    //   task.done();
    //   return;
    // }
    const hasChanged = compair(libraries);

    console.log({ hasChanged });
    if (hasChanged) {
      console.log("> librareis has changed");
      startBuildingDatabase(libraries);
      task.done();
    } else {
      task.done();
    }

    libraries.forEach(lib => {
      watcherInstance.push(
        watchForChange(lib, () => {
          watchAndIndex(libraries);
        })
      );
    });
  });

  startJob.ready();
}

ipcMain.on("quest-start", (_, args: string[]) => {
  console.log("starts with ", args);
  start(args);
});

// ipcMain.on("sleep-sync", async (event, params) => {
//   await timeout(Number(params))
//   event.reply("sleep-sync");
// });

initRoutes(questQueue);
questQueue.start();
