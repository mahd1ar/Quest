import Music from "./Music";
// import IndexBuilder from "./IndexBuilder";
import Message from "./Message";
import State from "./State";
import Notification from "./Notification";
import Shadow from "./Shadow";
import ID3 from "./ID3";

// export default interface IndexBuilder {
//   process(music: Shadow, params: any): void
//   createDirectory(): void
//   dump(): void
// }

interface IndexBuilder {
  basePath: string;
  correspondingName: string;

  existSync(): boolean;
  getMusic(id: string): Promise<Music>;
}

interface FileBuilder extends IndexBuilder {
  dump(): void;
  read(): Promise<Music>[];
  write(music: Music, ...args: any[]): void;
}

interface CategoryBuilder extends IndexBuilder {
  // categoryName:string;
  write(music: Music, ...args: any[]): void;
  dump(): void;
  createDirectory(): void;
  ls(): string[];
  read(): Promise<Music>[];
}

type CategoryTypes = "album" | "artist" | "library";

export {
  Music,
  ID3,
  IndexBuilder,
  CategoryBuilder,
  CategoryTypes,
  FileBuilder,
  Message,
  Notification,
  State,
  Shadow
};
