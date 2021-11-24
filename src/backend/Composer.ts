import { UNKNOWN, FrontEndListeners } from "@/schema/Enums";
import { BrowserWindow } from "electron";
import path from "path";
import { calcHash } from "./utils";
import NodeID3 from "node-id3";
import { glob } from "glob";
import { statSync } from "fs";
import { Shadow, Music } from "@/schema";
import { flattenDeep, remove } from "lodash";
import { ImageManager } from "./ImageManager";

function isShadow(params: Shadow[] | string[]): params is Shadow[] {
  return typeof params[0] !== "string";
}

export default class Composer {
  static seek(Libraries: string[] | string): Shadow[] {
    if (typeof Libraries === "string") Libraries = [Libraries];

    const res = Libraries.map(lib => {
      const library = lib;
      lib = path.normalize(lib + "/**/*.mp3");

      const musicList = glob.sync(lib, { nodir: true });

      return musicList.map((fullpath, id) => {
        fullpath = path.join(fullpath);

        const name = path.basename(fullpath);

        const song: Shadow = {
          id,
          modified: statSync(fullpath).mtimeMs,
          name,
          library,
          fullpath
        };

        return song;
      });
    });

    return flattenDeep(res);
  }

  private static makeShadow(library: string, fullpath: string): Shadow {
    const song: Shadow = {
      id: 1,
      modified: statSync(fullpath).mtimeMs,
      name: path.basename(fullpath),
      library,
      fullpath
    };

    return song;
  }

  static compose(
    param: string | string[] | Shadow | Shadow[],
    { library = "", isDirectory }: { library: string; isDirectory: boolean }
  ) {
    if (Array.isArray(param)) {
      if (!isShadow(param)) {
        if (isDirectory) {
          param = param.map(abspath => this.makeShadow(library, abspath));
        } else param = this.seek(param);
      }
    } else if (typeof param === "string")
      if (isDirectory) param = this.seek(param);
      else param = [this.makeShadow(library, param)];
    else param = [param];

    // const favorites = new Favorites();
    // const favs = favorites.all();

    const res = param.map(async shadow => {
      const hash = await calcHash(path.join(shadow.fullpath));

      return this.composeFromShadow(shadow, {
        hash,
        isFavorite: false //!!remove(favs, favMusic => favMusic === hash)[0]
      });
    });

    // favorites.remove(Object.fromEntries(favs.map((i, inx) => [`k${inx}`, i])));

    return res;
  }

  private static async composeFromShadow(
    musicShadow: Shadow,
    params: { hash: string; isFavorite: boolean }
  ) {
    const musicTags = await NodeID3.Promise.read(musicShadow.fullpath);

    const image = ImageManager.save(
      musicTags.album || UNKNOWN.ALBUM,
      musicTags.image
    );

    const music: Music = {
      id: musicShadow.id,
      album: musicTags.album || UNKNOWN.ALBUM,
      artist: musicTags.artist || UNKNOWN.ARTIST,
      fullpath: path.join(musicShadow.fullpath),
      library: musicShadow.library,
      modified: musicShadow.modified,
      name: musicShadow.name,
      title: musicTags.title || musicShadow.name.replace(".mp3", ""),
      favorite: params.isFavorite, // !!remove(favs, favMusic => favMusic === hash)[0],
      hash: params.hash,
      img: image //.basepath + "/" + image.name + "." + image.ext
    };

    return music;
  }
}
