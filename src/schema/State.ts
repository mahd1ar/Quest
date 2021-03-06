import Music from "./Music";
import Notification from "./Notification";

export default interface State {
  loading: boolean;
  notifications: Notification[];
  player: {
    isVisible: boolean;
    volume: number;
    progress: number;
    playList: string[]; // list of musics ids
    playListIndex: number;
    status: "playing" | "paused" | "empty" | "stopped" | "finished";
    duration: number;
    currentTime: number;
  };
  music: Music;
  libraries: string[];
  settings: {
    darkmode: boolean;
    color: string;
    emojis: string[];
  };
  canvas: {
    status: boolean;
  };
}
