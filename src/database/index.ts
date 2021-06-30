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
  Shadow,
  ImageManagerBufferType
} from "@/schema";
import { remove } from "lodash";
import dataurl from "dataurl";
import fs from "fs";
import NodeID3 from "node-id3";
import path from "path";
import { emptyAndFillArray } from "@/helpers";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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

// string[] | object | object[]
// function schemaIsNotStringArray<T>(index: Index<T>): T is string[] {
//   return index.fileExt !== "json"
// }

class Index<T> implements IndexBuilder {
  public basePath: string;

  constructor(
    public correspondingName: string,
    protected m_buffer: T,
    private location?: string | undefined,
    public fileExt?: "csv" | "json" | undefined
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
  // heey
  readFileSync(): T {
    const filecontent = fs.readFileSync(this.fullpath).toString();
    if (this.fileExt !== "json") {
      return <any>filecontent.split("\n").filter(Boolean);
    } else {
      return JSON.parse(filecontent);
    }
  }
  // dont use this
  writeBufferSync(): boolean {
    if (!this.m_buffer) return false;

    try {
      fs.writeFileSync(
        this.fullpath,
        Array.isArray(this.m_buffer) && this.fileExt !== "json"
          ? this.m_buffer.join("\n")
          : JSON.stringify(this.m_buffer, null, 2)
      );
      return true;
    } catch (error) {
      console.log("error in index => ");
      console.log(error);
      return false;
    }
  }
}

class Category extends Index<{ [key: string]: string[] }>
  implements CategoryBuilder {
  private categoryName?: string;
  // private buffer = {} as { [key: string]: string[] };

  constructor(correspondingName: CategoryTypes, categoryName?: string) {
    super(correspondingName, {}, undefined, "json");

    if (categoryName) this.categoryName = categoryName;
  }
  write(music: Music, isLastElement: boolean) {
    // if (!this.categoryName) //link random access mem
    //   this.categoryName = music[this.correspondingName];

    const catname = music[<CategoryTypes>this.correspondingName]; // like random access mem => ,usic[randomAccessMemory]

    if (this.m_buffer[catname]) {
      this.m_buffer[catname].push(music.id);
    } else {
      this.m_buffer[catname] = [music.id];
    }
    if (isLastElement) {
      this.writeBufferSync();
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
      const res = Object.assign({}, x, attributes);
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

class RecentlyAddedBuilder extends Index<string[]> implements FileBuilder {
  private recentlyAddedList: Music[] = [];
  private threshold = 20;
  constructor() {
    super("RecentlyAddedBuilder", []);
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
      this.recentlyAddedList
        .map(i => i.id)
        .forEach(i => {
          this.m_buffer?.push(i);
        });

      this.recentlyAddedList.length = 0;

      this.writeBufferSync();
    }
  }
}

class Favorites extends Index<{ id: string; fullpath: string }[]>
  implements FileBuilder {
  private favorites: { id: string; fullpath: string }[] = [];

  constructor() {
    super("Favorites", [], undefined, "json");
    this.m_buffer = !this.existSync() ? [] : this.readFileSync();
  }

  read(): Promise<Music>[] {
    return this.getAll().map(i => {
      return this.getMusic(i);
    });
  }

  write(music: Music, isLastElement: boolean): void {
    const result = remove(this.m_buffer, i => {
      return i.fullpath === music.fullpath;
    });

    if (result.length > 0) {
      music.favorite = true;
      this.favorites.push({ id: music.id, fullpath: music.fullpath });
    }

    if (isLastElement) {
      this.dump();
      emptyAndFillArray(this.m_buffer, this.favorites);
      this.favorites.length = 0;
      this.writeBufferSync();
    }
  }

  record(id: string, fullpath: string, value: boolean) {
    remove(this.m_buffer, i => {
      return i.fullpath === fullpath || i.id === id;
    });

    const shd = new Shadows();
    shd.update(id, { favorite: value });

    if (value) this.m_buffer.push({ id, fullpath });

    // fs.writeFileSync(this.fullpath, JSON.stringify(this.m_buffer, null, 2));
    this.writeBufferSync();
  }

  get(id: string): boolean {
    return this.m_buffer.some(i => i.id === id);
  }

  getAll(): string[] {
    return this.m_buffer.map(i => i.id);
  }
}

class ImageManager {
  private cacheLimit = 20;
  private m_buffer: ImageManagerBufferType[];
  basepath: string;
  private name = "artists_pictures";

  constructor() {
    this.basepath = path.join(global.questUserData, "/database");

    if (this.existsSync())
      this.m_buffer = JSON.parse(fs.readFileSync(this.fullpath).toString());
    else this.m_buffer = [];
  }

  private existsSync() {
    return fs.existsSync(this.fullpath);
  }

  setup() {
    // create file
    if (!this.existsSync()) this.writeBufferSync();

    // create folder that contains
    if (!fs.existsSync(path.join(this.basepath, this.name)))
      fs.mkdirSync(path.join(this.basepath, this.name));
  }

  find(key: keyof ImageManagerBufferType, value: any) {
    return this.m_buffer.find(i => i[key] === value);
  }

  findOrFetch(name: string): Promise<ImageManagerBufferType> {
    return new Promise((resolve, reject) => {
      const x = this.find("name", name);
      if (x) resolve(x);
      else
        this.create(name)
          .then(resolve)
          .catch(reject);
    });
  }

  private create(dataName: string): Promise<ImageManagerBufferType> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const imagePath = path.resolve(this.basepath, this.name, id + ".jpg");
      const writer = fs.createWriteStream(imagePath);
      this.m_buffer.push({
        name: dataName,
        address: imagePath,
        createdAt: Date.now()
      });

      const uri = "https://quest-backend.vercel.app/api";
      console.log("SENDING REQUEST");
      axios({
        url: uri + "/artists/?q=" + encodeURIComponent(dataName),
        method: "GET",
        responseType: "stream"
      })
        .then(response => {
          response.data.pipe(writer);

          writer.on("finish", () => {
            resolve(this.m_buffer.find(i => i.name === dataName)!);
          });

          writer.on("error", err => {
            this.remove("name", dataName);
            reject(err);
          });
        })
        .catch(err => {
          this.remove("name", dataName);
          reject(err);
        });
    });
  }

  public remove(key: keyof ImageManagerBufferType, value: any) {
    remove(this.m_buffer, i => i[key] === value);
  }
  public persist() {
    this.writeBufferSync();
  }

  private writeBufferSync() {
    fs.writeFileSync(this.fullpath, JSON.stringify(this.m_buffer, null, 2));
  }

  get fullpath() {
    return path.resolve(this.basepath, this.name + ".json");
  }
}
export { RecentlyAddedBuilder, Shadows, Category, Favorites, ImageManager };
