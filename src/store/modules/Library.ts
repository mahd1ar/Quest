import { Module } from "vuex";
import { VuexState, Music } from "@/schema";
import { remove } from "lodash";
import { useGlobalState } from "@/store/GlobalState";

const library: Module<VuexState["library"], VuexState> = {
  namespaced: true,
  state: () => ({
    list: []
  }),
  mutations: {},
  actions: {
    dump: ({ state }) => {
      state.list.splice(0, state.list.length);
    },
    add: ({ state }, newMusic: Music) => {
      state.list.push(newMusic);
    },
    remove: ({ state, dispatch }, id: string) => {
      remove(state.list, music => (music.hash = id));
    },
    toggleFavorite: ({ state: s }, id: number) => {
      console.log("favorite:", s.list[id]);
      const globalState = useGlobalState();
      const oldState = s.list[id].favorite;
      s.list[id].favorite = !oldState;

      remove(
        globalState.value.favorites,
        (item: string) => item === s.list[id].hash
      );

      if (!oldState) globalState.value.favorites.push(s.list[id].hash);
    },
    reIndex: ({ state: s }) => {
      s.list.forEach((item, index) => {
        item.id = index;
      });
    },
    sort: ({ state: s }) => {
      s.list.sort((a, b) => a.modified - b.modified);
    }
  },
  getters: {
    musics: s => {
      return s.list;
    },
    favorites: s => {
      return s.list.filter(m => m.favorite);
    }
  }
};

export default library;
