declare const __static: string;

import NodeID3 from "node-id3";
import path from "path";
import { UNKNOWN } from "@/schema/Enums";
import fs from "fs";
import crypto from "crypto";
import { makeDirectory } from "./utils";

export class ImageManager {
  static readonly PATH = path.join(__static, "database/album_arts");

  static save(albumName: string, nodeid3image: NodeID3.Tags["image"]) {
    console.log(albumName);
    const name = this.hashName(albumName);
    const imgParams = this.compose(nodeid3image);
    makeDirectory(this.PATH);
    this.write(Object.assign(imgParams, { name })); // MAKE THIS ONE AYNC
    return path.join(this.PATH, name + "." + imgParams.ext); //{ ext: imgParams.ext, name, basepath: this.PATH }
  }

  static dump() {
    fs.rmdir(this.PATH, { recursive: true }, err => {
      if (err) console.error(err);
    });
  }
  private static hashName(albumName: string) {
    return crypto
      .createHash("md5")
      .update(albumName)
      .digest("hex");
  }

  private static compose(nodeid3: NodeID3.Tags["image"]) {
    const REGEX = /^data:.+\/(.+);base64,(.*)$/;
    let ext: string;
    let data: string;
    let matches: RegExpMatchArray;
    let buffer: Buffer;

    if (typeof nodeid3 === "string") {
      matches = nodeid3.match(REGEX)!;
      ext = matches[1];
      data = matches[2];
      buffer = Buffer.from(data, "base64");
      return { ext, buffer };
    } else if (nodeid3 === undefined) {
      matches = UNKNOWN.IMG.match(REGEX)!;
      ext = matches[1];
      data = matches[2];
      buffer = Buffer.from(data, "base64");
      return { ext, buffer };
    } else {
      ext = nodeid3.mime.split("/")[1];

      return { ext, buffer: nodeid3.imageBuffer };
    }
  }

  private static write(params: {
    name: string;
    ext: string;
    buffer: Buffer;
  }): void {
    const fullpath = path.join(this.PATH, params.name + "." + params.ext);

    if (!fs.existsSync(fullpath)) {
      fs.writeFile(fullpath, params.buffer, err => {
        if (err) console.error("ERRORRRR=>", err);
        else console.log("successfully created");
      });
    }
  }
}
