"use strict";

import { Music, Shadow } from "@/schema";
import chokidar from "chokidar";
import dataurl from "dataurl";
import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import fs from "fs";
import { glob } from "glob";
import { flattenDeep } from "lodash";
import NodeID3 from "node-id3";
import path from "path";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { AlbumBuilder, ArtistBuilder, FolderBuilder, RecentlyAddedBuilder, ShadowBuilder } from "./database";
import { areDiffrent } from "./helpers";
import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "./providers/constants";
import { route } from "./providers/router";
import { MainQueue, Task } from "./providers/utilities";
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
    // frame: false,
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
    // const data = readFileSync(arg.data);
    event.returnValue = x;
  }
);

ipcMain.on("add-new-lib", event => {
  const res = dialog.showOpenDialogSync({ properties: ["openDirectory"] });
  if (res) {
    event.returnValue = res[0];
  }
});

// win: Electron.BrowserWindow

// INDEX MUSICS MECHANISM

// GLOBALS

global.questUserData = app.getPath("userData");

namespace Scanner {
  export function seekMusic(libs: Array<string> | string) {
    if (typeof libs === "string") libs = [libs];

    let res = libs.map(lib_path => {
      // if (lib_path[lib_path.length - 1] === path.sep) {
      //   lib_path = lib_path.slice(0, lib_path.length - 1);
      // }
      const library = lib_path;
      lib_path = path.normalize(lib_path + "/**/*.mp3");

      const musicList = glob.sync(lib_path, { nodir: true });

      return musicList.map(fullpath => {
        const id = Buffer.from(fullpath, "ascii").toString("base64");
        //OLD
        // const name = fullpath.split('/')[fullpath.split('/').length - 1]
        //NEW
        const name = path.basename(fullpath);
        // const res = await NodeID3.Promise.read(fullpath);

        const song: Shadow = {
          id,
          modified: fs.statSync(fullpath).mtimeMs,
          name,
          library,
          fullpath
          // album: res.album || UNKNOWN_ALBUM,
          // artist: res.album || UNKNOWN_ARTIST,
          // title: res.title || name.replace(".mp3", "")
        };
        return song;
      });

      // return await Promise.all(musicShadows);
    });

    return flattenDeep(res);
  }
}

const watcherInstance: chokidar.FSWatcher[] = [];

// let timeoutHandler: NodeJS.Timeout
function startBuildingDatabase(absPath: string[]) {
  // <NEW>

  const albums = new AlbumBuilder();
  const artist = new ArtistBuilder();
  const shadow = new ShadowBuilder();
  const recentlyAdded = new RecentlyAddedBuilder(20);
  const buildFolders = new FolderBuilder();

  albums.dump();
  artist.dump();
  shadow.dump();
  recentlyAdded.dump();
  buildFolders.dump();

  albums.createDirectory();
  artist.createDirectory();
  shadow.createDirectory();
  recentlyAdded.createDirectory();
  buildFolders.createDirectory();

  const musicObjects = Scanner.seekMusic(absPath);

  musicObjects.forEach((shade, inx: number) => {
    new Task(questQueue, async task => {
      const musicTags = await NodeID3.Promise.read(shade.fullpath);

      const music: Music = {
        id: shade.id,
        album: musicTags.album || UNKNOWN_ALBUM,
        artist: musicTags.artist || UNKNOWN_ARTIST,
        fullpath: shade.fullpath,
        library: shade.library,
        modified: shade.modified,
        name: shade.name,
        title: musicTags.title || shade.name.replace(".mp3", "")
      };

      albums.process(music);
      artist.process(music);
      buildFolders.process(music);

      recentlyAdded.process(music, musicObjects.length === inx + 1);

      shadow.process(music);
      task.done();
    }).ready();
  });

  // Debuger
  console.log("end of start building database");
}

async function compair(entryPints: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const folders = new FolderBuilder();

    if (!folders.existsSync()) {
      resolve(true);
      return;
    }

    if (areDiffrent(folders.getFoldersList(), entryPints)) {
      resolve(true);
      return;
    }
    const shadow = new ShadowBuilder();
    if (!fs.existsSync(shadow.correspondingLocation)) {
      resolve(true);
      return;
    }
    // compaire contents
    let c = folders.getFoldersList().map(async folderName => {
      const indexOfMusicInFolder = fs
        .readdirSync(shadow.correspondingLocation)
        .map(i =>
          JSON.parse(
            fs.readFileSync(shadow.correspondingLocation + "/" + i).toString()
          )
        )
        .filter((i: Music) => i.library === folderName)
        .map(i => i.fullpath);

      return entryPints.map(ep => {
        const musicList = glob.sync(ep + "/**/*.mp3", { nodir: true });

        return areDiffrent(musicList, indexOfMusicInFolder);
      });
    });

    Promise.all(c)
      .then(i => {
        resolve(flattenDeep(i).some(Boolean));
      })
      .catch(err => {
        reject(err);
      });
  });
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
  // rebuild()
  // ***
  startBuildingDatabase(libraries);

  watcherInstance.forEach(watchre => watchre.close());
  watcherInstance.splice(0, watcherInstance.length);

  BrowserWindow.getAllWindows()[0].webContents.send("DB-Changed");
  console.log("EVENT FIREDDDDDD");

  // VVV
  // libraries.forEach(lib => {
  //   const w = watchForChange(lib, () => {
  //     watchAndIndex(libraries);
  //   });
  //   watcherInstance.push(w);
  // });
}

// entry point
async function start(libraries: string[]) {
  const startJob = new Task(questQueue, async task => {
    if (libraries.length === 0) {
      task.done();
      return;
    }

    const hasChanged = await compair(libraries);

    if (hasChanged) {
      console.log("librareis has changed");
      startBuildingDatabase(libraries);
      task.done();
    } else {
      task.done();
    }
// VVV
    // libraries.forEach(lib => {
    //   watcherInstance.push(
    //     watchForChange(lib, () => {
    //       watchAndIndex(libraries);
    //     })
    //   );
    // });
  });

  startJob.ready();
}

ipcMain.on("quest-start", (_, args: string[]) => {
  start(args); // ["/home/mahdiyar/Music"];
});

// test
// setTimeout(() => {
//   startBuildingDatabase(["/home/mahdiyar/Music"])
// }, 1500);

route("home", questQueue, async () => {
  const a = new AlbumBuilder();
  // const b = new ArtistBuilder();
  const c = new RecentlyAddedBuilder();

  // let artist = await Promise.all(b.get());
  let album = await Promise.all(a.ls());
  let recentlyAdded = await Promise.all(c.get());

  return { album, /*, artist, */ recentlyAdded };
});

questQueue.start();
