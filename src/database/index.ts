import fs from "fs";
import path from "path";
import { IndexBuilder, Music, Shadow, Categury } from "@/schema";
import {
  UNKNOWN_IMG,
  UNKNOWN_ALBUM,
  UNKNOWN_ARTIST
} from "@/providers/constants";
import NodeID3 from "node-id3";
import { flattenDeep } from "lodash";
import dataurl from "dataurl";

function getImageTag({ image }: NodeID3.Tags): string {
  let img: string;
  image;
  if (image) {
    if (typeof image === "string") img = image;
    else
      img = dataurl.convert({ data: image.imageBuffer, mimetype: image.mime });
  } else {
    img = UNKNOWN_IMG;
  }
  return img;
}

abstract class FileBuilder implements IndexBuilder {
  constructor(
    protected _correspondingLocation: string,
    public isDirectory = true
  ) {}

  abstract process(music: Music, params: any): void;
  protected database_path: string = path.join(
    global.questUserData,
    "/database"
  );
  createDirectory(): void {
    if (this.isDirectory)
      if (!this.existsSync()) fs.mkdirSync(this.correspondingLocation);
  }
  dump(): void {
    if (this.existsSync())
      fs.rmdirSync(this.correspondingLocation, { recursive: true });
    // fs.mkdirSync(this.correspondingLocation)
  }

  existsSync() {
    return fs.existsSync(this.correspondingLocation);
  }

  get(...args: any[]): Promise<Music>[] {
    if (this.isDirectory) {
      let r = flattenDeep(
        (fs.readdirSync(this.correspondingLocation) ?? []).map(i =>
          fs
            .readFileSync(path.join(this.correspondingLocation, i))
            .toString()
            .split("\n")
            .filter(Boolean)
        )
      );

      return r.map(i => this.getShadow(i));
    }

    let shadows = JSON.parse(
      fs.readFileSync(this.correspondingLocation).toString() ?? "[{}]"
    ).filter(Boolean) as Shadow[];

    return shadows.map(i => this.getShadow(i));
  }

  protected async getShadow(param: string | Shadow): Promise<Music> {
    let shadowFile: Shadow;

    if (typeof param === "string") {
      param = Buffer.from(param, "ascii").toString("base64");
      shadowFile = JSON.parse(
        fs
          .readFileSync(
            path.join(
              "/home/mahdiyar/.config/quest/database/shadows",
              `${param}.json`
            )
          )
          .toString()
      );
    } else {
      shadowFile = param;
    }

    const tags = await NodeID3.Promise.read(shadowFile.fullpath);

    let img: string;

    if (tags.image) {
      if (typeof tags.image === "string") img = tags.image;
      else
        img = dataurl.convert({
          data: tags.image.imageBuffer,
          mimetype: tags.image.mime
        });
    } else {
      img = UNKNOWN_IMG;
    }

    return Object.assign({}, shadowFile, {
      album: tags.album || UNKNOWN_ALBUM,
      artist: tags.artist || UNKNOWN_ARTIST,
      img,
      title: tags.title || shadowFile.name.replace(".mp3", "")
    });
  }

  public get correspondingLocation() {
    return this._correspondingLocation;
  }
}

class AlbumBuilder extends FileBuilder {
  readonly delimiter: string;

  constructor() {
    const pathname = path.join(
      global.questUserData,
      "/database/indexes/albums"
    );
    super(pathname);
    this.delimiter = "\n";
  }

  public process(music: Music) {
    this.add(music.album, music.fullpath);
  }

  private add(album: string, value: string) {
    fs.appendFileSync(
      path.join(this.correspondingLocation, album),
      `${value}\n`
    );
  }

  ls(): Promise<Categury>[] {
    let res = fs.readdirSync(this.correspondingLocation) ?? [];

    return res.map(async name => {
      const fullpath = path.normalize(
        path.join(this.correspondingLocation, name)
      );
      const sampleMusic = fs
        .readFileSync(fullpath)
        .toString()
        .split("\n")
        .filter(Boolean)[0];

      const tag = await NodeID3.Promise.read(sampleMusic);

      let img: string;

      if (tag.image) {
        if (typeof tag.image === "string") img = tag.image;
        else
          img = dataurl.convert({
            data: tag.image.imageBuffer,
            mimetype: tag.image.mime
          });
      } else {
        img = UNKNOWN_IMG;
      }

      return {
        image: img,
        name
      };
    });
  }
}

class ArtistBuilder extends FileBuilder {
  constructor() {
    const artistDir = path.join(
      global.questUserData,
      "/database/indexes/artists"
    );
    super(artistDir);
  }

  process(music: Music): void {
    // const res = await NodeID3.Promise.read(fullpath);
    fs.appendFileSync(
      path.join(this.correspondingLocation, music.album),
      `${music.fullpath}\n`
    );
  }
}

class ShadowBuilder extends FileBuilder {
  constructor() {
    const shadowsDir = path.join(global.questUserData, "/database/shadows");
    super(shadowsDir);
  }

  process({ id, fullpath, name, library, modified }: Music): void {
    const x: Shadow = {
      fullpath,
      id,
      library,
      modified,
      name
    };

    fs.writeFileSync(
      path.join(this.correspondingLocation, id + ".json"),
      JSON.stringify(x, null, 2)
    );
  }
}

class RecentlyAddedBuilder extends FileBuilder {
  private recentlyAddedList: { id: string; modified: number }[] = [];
  // private threshold: number | undefined;

  constructor(private threshold: number = 20) {
    super(
      path.join(
        global.questUserData,
        "/database/indexes/recently_added.ind.json"
      ),
      false
    );
  }

  process(music: Music, isLastElement: boolean): void {
    // if (!this.threshold) throw new Error("Threshold is undefied");

    if (this.recentlyAddedList.length < this.threshold)
      this.recentlyAddedList.push(music);
    else this.recentlyAddedList[this.threshold] = music;

    // console.log(this.recentlyAddedList.length + "\n")

    if (isLastElement) {
      this.recentlyAddedList.sort((a, b) => b.modified - a.modified);

      fs.writeFileSync(
        this.correspondingLocation,
        JSON.stringify(this.recentlyAddedList, null, 2)
      );
    }
  }
  dump() {
    if (fs.existsSync(this.correspondingLocation))
      fs.unlinkSync(this.correspondingLocation);
  }
}

class FolderBuilder extends FileBuilder {
  constructor() {
    const foldersDir = path.join(
      global.questUserData,
      "/database/indexes/folders"
    );
    super(foldersDir);
  }

  process(music: Music): void {
    const folderPath = path.dirname(music.fullpath); // /home/music/an/ -some.pm3 // music.fullpath.split('/').splice(0, music.fullpath.split('/').length - 1).join(path.sep)
    const foldername64 = Buffer.from(folderPath).toString("base64"); //
    fs.appendFileSync(
      path.join(this.correspondingLocation, foldername64 + ".csv"),
      music.id + "\n"
    );
  }

  get(foldername: string) {
    const filePath = path.join(
      this.correspondingLocation,
      Buffer.from(foldername, "ascii").toString("base64") + ".csv"
    );
    const data = fs.readFileSync(filePath);

    return data
      .toString()
      .split("\n")
      .filter(Boolean)
      .map(i => this.getShadow(i));
  }

  getFoldersList(): string[] {
    const data = fs.readdirSync(this.correspondingLocation);

    if (data.length === 0) return [];

    const librareis = data
      .map(d => Buffer.from(d.split(".")[0], "base64").toString("ascii"))
      .filter((el, _, array) => !array.includes(path.dirname(el)));

    return librareis;
  }
}

export {
  FolderBuilder,
  RecentlyAddedBuilder,
  AlbumBuilder,
  ArtistBuilder,
  ShadowBuilder
};
