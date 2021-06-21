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

export default {
  resumeMusic,
  pauseMusic,
  stopMusic,
  emptyMusic,
  setlibs,
  // addlib,
  playMusic,
  seek,
  alert,
  toggleHeart,
  changeLibraries
};
