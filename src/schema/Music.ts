// export default interface Music {
//   id: string;
//   name: string;
//   fullpath: string;
//   modified: number;
//   library: string;
//   album: string;
//   artist: string;
//   title: string;
//   img?: string;
// }
import ID3 from "./ID3";
import Shadow from "./Shadow";

interface Meta {
  hash: string;
  favorite: boolean;
}

export default interface Music extends ID3, Shadow, Meta {}
