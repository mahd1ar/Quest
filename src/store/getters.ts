import { State } from "../schema";

export default {
  currentMusic: (state: State) => state.music,
  progress: (state: State) => state.player.progress,
  musicStatus: (state: State) => state.player.status,
  notifications: (state: State) => state.notifications,
  canvasStatus: (state: State) => state.canvas.status
};
