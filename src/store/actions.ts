import { ActionContext } from "vuex";
import { State, Notification } from "../schema";

let setlibs = ({ commit: c }: ActionContext<State, State>, vals: string[]) => {
  c("setLibs", vals);
};

let addlib = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("addLib", val);
  return "zero";
};

let resumeMusic = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("resumeMusic", val);
};

let pauseMusic = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("pauseMusic", val);
};

const playMusic = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("playMusic", val);
};

const seek = ({ commit: c }: ActionContext<State, State>, val: string) => {
  c("seek", val);
};

const alert = (
  { commit: c }: ActionContext<State, State>,
  val: Notification
) => {
  if (!val.type) val.type = "log";

  c("pushNotification", val);
};

export default {
  resumeMusic,
  pauseMusic,
  setlibs,
  addlib,
  playMusic,
  seek,
  alert
};
