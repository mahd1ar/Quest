import { createStore } from "vuex";
import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import { State } from "@/schema";

// default parameters

const volume = localStorage.getItem("quest.player.volume")
  ? Number(localStorage.getItem("quest.player.volume"))
  : 50;

function getSevedSettings<T>(key: string, defaultSettings: T): T {
  return localStorage.getItem(`quest-user-${key}`)
    ? JSON.parse(localStorage.getItem(`quest-user-${key}`)!)
    : defaultSettings;
}

const settings = getSevedSettings("settings", {
  color: "cyan-300",
  darkmode: false,
  emojis: []
});

const libraries = getSevedSettings("libraries", []);

const store = createStore({
  state() {
    const state: State = {
      loading: false,
      notifications: [],
      player: {
        isVisible: true,
        volume,
        progress: 0,
        playList: [],
        playListIndex: -1,
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
      libraries,
      settings,
      canvas: { status: false }
    };
    return state;
  },
  mutations,
  actions,
  getters
});

export default store;
