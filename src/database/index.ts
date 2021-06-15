import {
  UNKNOWN_ALBUM,
  UNKNOWN_ARTIST,
  UNKNOWN_IMG
} from "@/providers/constants";
import {
  CategoryBuilder,
  CategoryTypes,
  FileBuilder,
  IndexBuilder,
  Music,
  Shadow
} from "@/schema";
import { remove } from "lodash";
import dataurl from "dataurl";
import fs from "fs";
import NodeID3 from "node-id3";
import path from "path";

// function getImageTag({ image }: NodeID3.Tags): string {
//   let img: string;
//   image;
//   if (image) {
//     if (typeof image === "string") img = image;
//     else
//       img = dataurl.convert({ data: image.imageBuffer, mimetype: image.mime });
//   } else {
//     img = UNKNOWN_IMG;
//   }
//   return img;
// }

class Index implements IndexBuilder {
  public basePath: string;
  constructor(
    public correspondingName: string,
    private location?: string | undefined,
    private fileExt?: "csv" | "json" | undefined
  ) {
    this.basePath = path.join(global.questUserData, "/database");
  }

  existSync(): boolean {
    return fs.existsSync(this.fullpath);
  }
  dump(): void {
    console.log("dumping");
    if (this.existSync()) {
      fs.unlinkSync(this.fullpath);
    }
  }

  createDirectory() {
    if (this.location)
      if (!this.existSync())
        fs.mkdirSync(path.join(this.basePath, this.location));
  }

  get fullpath() {
    const location = this.location || "";
    return path.join(this.basePath, location, this.correspondingName);
  }
  async getMusic(id: string): Promise<Music> {
    const shadowFile: Shadow = JSON.parse(
      fs
        .readFileSync(path.join(this.basePath, "/shadows", id + ".json"))
        .toString()
    );

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

    return {
      ...shadowFile,
      album: tags.album || UNKNOWN_ALBUM,
      artist: tags.artist || UNKNOWN_ARTIST,
      img,
      title: tags.title || shadowFile.name.replace(".mp3", "")
    };
  }
  getShadow(id: string): Shadow {
    return JSON.parse(
      fs
        .readFileSync(path.join(this.basePath, "/shadows", id + ".json"))
        .toString()
    );
  }
  readFileSync(): string[] | object {
    console.log("trying to find and read", this.correspondingName);
    let filecontent = fs.readFileSync(this.fullpath).toString();
    if (this.fileExt === "json") return JSON.parse(filecontent);
    else return filecontent.split("\n").filter(Boolean);
  }
}

class Category extends Index implements CategoryBuilder {
  private categoryName?: string;
  private buffer = {} as { [key: string]: string[] };
  constructor(correspondingName: CategoryTypes, categoryName?: string) {
    super(correspondingName, undefined, "json");
    if (categoryName) this.categoryName = categoryName;
  }
  write(music: Music, isLastElement: boolean) {
    // if (!this.categoryName) //link random access mem
    //   this.categoryName = music[this.correspondingName];

    // @ts-ignore
    let catname = music[this.correspondingName]; // like random access mem

    if (this.buffer[<string>catname]) {
      this.buffer[<string>catname].push(music.id);
    } else {
      this.buffer[<string>catname] = [music.id];
    }
    if (isLastElement) {
      console.log("VvvvvvvvvvvvvvvvvvvV");
      console.log(this.buffer);
      console.log("^^^^^^^^^^^^^^^");
      fs.writeFileSync(this.fullpath, JSON.stringify(this.buffer, null, 2));
    }
  }

  ls() {
    // {[key:string] : string[]}
    // {
    //   "random acess mem" : ["123","124","456"]
    //   "Butifull youn woman" : ["123","124","456"]
    // }
    return this.existSync()
      ? Object.keys(<{ [key: string]: string[] }>this.readFileSync())
      : [];
  }
  read(): Promise<Music>[] {
    return this.get().map(i => this.getMusic(i));
  }

  get(catname?: string): string[] {
    if (catname) this.categoryName = catname;

    // TODO: this logic is bullshit ! delete this later
    if (!this.categoryName) throw new Error("category name are not provided");

    if (!this.existSync()) {
      return [];
    }
    const contents = <{ [key: string]: string[] }>this.readFileSync();

    const idString: string[] = Object.keys(contents).includes(this.categoryName)
      ? contents[this.categoryName]
      : [];
    return idString;
  }
}

class Shadows {
  private correspondingLocation: string;
  constructor() {
    this.correspondingLocation = path.join(
      global.questUserData,
      "/database/shadows"
    );
  }
  find(id: string): Shadow | undefined {
    let shadow: Shadow | undefined = undefined;
    console.log(path.join(this.correspondingLocation, id + ".json"));
    if (
      this.existSync() &&
      fs.existsSync(path.join(this.correspondingLocation, id + ".json"))
    )
      shadow = JSON.parse(
        fs
          .readFileSync(path.join(this.correspondingLocation, id + ".json"))
          .toString()
      );
    return shadow;
  }
  update(id: string, attributes: object) {
    const x = this.find(id);
    if (x) {
      let res = Object.assign({}, x, attributes);
      fs.writeFileSync(
        path.join(this.correspondingLocation, id + ".json"),
        JSON.stringify(res, null, 2)
      );
      return true;
    }
    return false;
  }
  createDirectory() {
    if (!this.existSync()) fs.mkdirSync(this.fullpath);
  }

  existSync() {
    return fs.existsSync(this.correspondingLocation);
  }
  get fullpath() {
    return this.correspondingLocation;
  }

  getAll(): Shadow[] {
    if (!this.existSync()) {
      return [];
    }

    return fs.readdirSync(this.fullpath).map(i => {
      return JSON.parse(
        fs.readFileSync(path.join(this.fullpath, i)).toString()
      );
    });
  }

  write({ id, fullpath, name, library, modified, favorite }: Music): void {
    const x: Shadow = {
      fullpath,
      id,
      library,
      modified,
      name,
      favorite
    };

    fs.writeFileSync(
      path.join(this.fullpath, id + ".json"),
      JSON.stringify(x, null, 2)
    );
  }

  dump() {
    fs.rmdirSync(this.fullpath, { recursive: true });
  }
}

class RecentlyAddedBuilder extends Index implements FileBuilder {
  private recentlyAddedList: Music[] = [];
  private threshold = 20;
  constructor() {
    super("RecentlyAddedBuilder");
  }

  read(): Promise<Music>[] {
    return this.get().map(i => this.getMusic(i));
  }

  get(): string[] {
    return this.existSync() ? <string[]>this.readFileSync() : [];
  }
  write(music: Music, isLastElement: boolean): void {
    if (this.recentlyAddedList.length < this.threshold)
      this.recentlyAddedList.push(music);
    else this.recentlyAddedList[this.threshold] = music;

    if (isLastElement) {
      this.recentlyAddedList.sort((a, b) => b.modified - a.modified);

      fs.writeFileSync(
        this.fullpath,
        this.recentlyAddedList.map(i => i.id).join("\n")
      );
    }
  }
}

class Favorites extends Index implements FileBuilder {
  private favorites: { id: string; fullpath: string }[] = [];
  constructor() {
    super("Favorites", undefined, "json");
    if (!this.existSync()) this.favorites = [];
    else
      this.favorites = <{ id: string; fullpath: string }[]>this.readFileSync();
  }
  read(): Promise<Music>[] {
    return this.getAll().map(i => {
      return this.getMusic(i);
    });
  }
  write(music: Music, ...args: any[]): void {
    const result = remove(this.favorites, i => {
      return i.fullpath === music.fullpath;
    });

    music.favorite = result.length > 0;
  }

  record(id: string, fullpath: string, value: boolean) {
    remove(this.favorites, i => {
      return i.fullpath === fullpath || i.id === id;
    });

    let shd = new Shadows();
    shd.update(id, { favorite: value });

    if (value) this.favorites.push({ id, fullpath });

    fs.writeFileSync(this.fullpath, JSON.stringify(this.favorites, null, 2));
  }

  get(id: string): boolean {
    return this.favorites.some(i => i.id === id);
  }

  getAll(): string[] {
    return this.favorites.map(i => i.id);
  }
}

export { RecentlyAddedBuilder, Shadows, Category, Favorites };
