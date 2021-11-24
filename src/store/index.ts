import { createStore } from "vuex";
import { VuexState } from "@/schema";
import player from "./modules/Player";
import library from "./modules/Library";

// default parameters

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

// const store = createStore({
//   state() {
//     const state: State = {
//       loading: false,
//       notifications: [],
//       libraries,
//       settings,
//       canvas: { status: false }
//     };
//     return state;
//   },
//   mutations,
//   actions,
//   getters
// });

const store = createStore<VuexState>({
  modules: { player, library }
});

export default store;
