import { Shadow } from "@/schema";
import fs from "fs";
import { glob } from "glob";
import { flattenDeep } from "lodash";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export function seekMusic(libs: Array<string> | string): Shadow[] {
  if (typeof libs === "string") libs = [libs];

  const res = libs.map(lib_path => {
    const library = lib_path;
    lib_path = path.normalize(lib_path + "/**/*.mp3");

    const musicList = glob.sync(lib_path, { nodir: true });

    return musicList.map(fullpath => {
      fullpath = path.join(fullpath);
      const id = uuidv4();

      const name = path.basename(fullpath);

      const song: Shadow = {
        id,
        modified: fs.statSync(fullpath).mtimeMs,
        name,
        library,
        fullpath
      };

      return song;
    });

    // return await Promise.all(musicShadows);
  });

  return flattenDeep(res);
}
