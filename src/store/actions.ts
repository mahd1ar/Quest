import { ActionContext } from "vuex";
import { State, Notification } from "../schema";

const setlibs = (
  { commit: c }: ActionContext<State, State>,
  vals: string[]
) => {
  c("setLibs", vals);
};

// const addlib = ({ commit: c }: ActionContext<State, State>, val: string) => {
//   c("addLib", val);
//   return "zero";
// };

const resumeMusic = (
  { commit: c }: ActionContext<State, State>,
  val: string
) => {
  c("resumeMusic", val);
};

const pauseMusic = (
  { commit: c }: ActionContext<State, State>,
  val: string
) => {
  c("pauseMusic", val);
};

const playMusic = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("playMusic", val);
  // c("clearQueue")
};

const seek = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("seek", val);
};

const stopMusic = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("stopMusic", val);
};

const emptyMusic = (
  { commit: c }: ActionContext<State, State>,
  val: string
) => {
  c("emptyMusic", val);
};

const hideMusicPanel = (
  { commit: c }: ActionContext<State, State>,
  val: boolean
) => {
  if (val) c("hideMusicPanel", val);
  else c("showMusicPanel", val);
};

const alert = (
  { commit: c }: ActionContext<State, State>,
  val: Notification
) => {
  if (!val.type) val.type = "log";

  c("pushNotification", val);
};

const toggleHeart = (
  { commit: c }: ActionContext<State, State>,
  val: undefined | boolean
) => {
  c("toggleHeart", val);
};

const changeLibraries = (
  { commit: c }: ActionContext<State, State>,
  val: string[]
) => {
  c("changeLibraries", val);
};

const addToQueue = (
  { commit: c }: ActionContext<State, State>,
  val: string[]
) => {
  c("addToQueue", val);
};

const nextSong = (
  { commit: c }: ActionContext<State, State>,
  val: string[]
) => {
  c("nextSong", val);
};

const previousSong = (
  { commit: c }: ActionContext<State, State>,
  val: string[]
) => {
  c("previousSong", val);
};

const canvasDidMount = (
  { commit: c }: ActionContext<State, State>,
  val: boolean
) => {
  if (val) c("canvasMounted", val);
  else c("canvasUnmounted", val);
};

export default {
  addToQueue,
  resumeMusic,
  nextSong,
  previousSong,
  pauseMusic,
  stopMusic,
  emptyMusic,
  hideMusicPanel,
  setlibs,
  // addlib,
  playMusic,
  seek,
  alert,
  toggleHeart,
  changeLibraries,
  canvasDidMount
};
