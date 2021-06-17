import Music from "./Music";
import Notification from "./Notification";

export default interface State {
  loading: boolean;
  notifications: Notification[];
  player: {
    volume: number;
    progress: number;
    nextSong?: Music | string;
    preSong?: Music | string;
    status: "playing" | "paused" | "empty" | "stopped" | "finished";
    duration: number;
    currentTime: number;
  };
  music: Music;
  libraries: string[];
}
