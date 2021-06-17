import { createStore } from "vuex";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import * as Schema from "../schema";

// default parameters
const volume = localStorage.getItem("quest.player.volume")
  ? Number(localStorage.getItem("quest.player.volume"))
  : 50;
// const progress =  localStorage.getItem("quest.player.progress") ? Number(localStorage.getItem("quest.player.progress")): 0;
const libraries: string[] = localStorage.getItem("quest-user-libraries")
  ? JSON.parse(localStorage.getItem("quest-user-libraries")!)
  : [];

const store = createStore({
  state() {
    const state: Schema.State = {
      loading: false,
      notifications: [],
      player: {
        volume,
        progress: 0,
        nextSong: undefined,
        preSong: undefined,
        status: "empty",
        duration: 0,
        currentTime: 0
      },
      music: {
        album: "",
        artist: "",
        fullpath: "",
        id: "",
        library: "",
        modified: 0,
        name: "",
        title: "",
        img: "",
        favorite: false
      },
      libraries
    };
    return state;
  },
  mutations,
  actions,
  getters
});

export default store;
