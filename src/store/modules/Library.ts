import { Module } from "vuex";
import { VuexState, Music } from "@/schema";
import { remove } from "lodash";

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
    toggleFavorite: ({ state: s }, id: string) => {
      const x = s.list.find(li => li.hash === id);
      if (x !== undefined) {
        x.favorite = !x.favorite
        return true;
      } else
        return false;

    },
    reIndex: ({ state: s }) => {
      s.list.forEach((item, index) => {
        item.id = index
      })
    }
  },
  getters: {
    musics: s => {
      return s.list;
    },
    favorites: s => {
      return s.list.filter(m => m.favorite)
    }
  }
};

export default library;
