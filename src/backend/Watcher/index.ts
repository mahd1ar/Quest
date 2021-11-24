import _watch from "./_watch";
import Composer from "../Composer";
import { BrowserWindow } from "electron";
import { FrontEndListeners } from "@/schema/Enums";

export default class Watcher extends _watch {
  addedHook(params: { directory: string; newFile: string }) {
    // const favorites = new Favorites();
    console.log("new music added");
    console.log("params : " + params);
    const musics = Composer.compose(params.newFile, {
      isDirectory: false,
      library: params.directory
    });

    musics.forEach(async music => {
      const m = await music;

      BrowserWindow.getAllWindows()[0].webContents.send(
        FrontEndListeners.addToLibrary,
        m
      );
    });

    // const results = await Promise.allSettled(musics)

    // console.log(results)
  }
  removedHook(params: { directory: string; newFile: string }): void {
    throw new Error("Method not implemented.");
  }

  constructor(libs: string[]) {
    super(libs);
  }
}
