import { State } from "../schema";

export default {
  progress: (state: State) => state.player.progress,
  musicStatus: (state: State) => state.player.status,
  notifications: (state: State) => state.notifications
};
