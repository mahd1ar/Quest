import { Shadow } from "@/schema";
import fs from "fs";
import { glob } from "glob";
import { flattenDeep } from "lodash";
import path from "path";

export function seekMusic(libs: Array<string> | string): Shadow[] {
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
