import { Module } from "vuex";
import { VuexState, Music } from "@/schema";
import { Howl } from "howler";
import { useIntervalFn, Pausable } from "@vueuse/core";
import { LocalStorage } from "@/schema/Enums";

const volume = localStorage.getItem(LocalStorage.volume)
  ? Number(localStorage.getItem(LocalStorage.volume))
  : 50;

const howlerInstance: Howl[] = [];
// const howlerInstance = [Howl];

let timeTracker: Pausable;

const player: Module<VuexState["player"], VuexState> = {
  namespaced: true,
  state: (): VuexState["player"] => ({
    isVisible: true,
    volume,
    progress: 0,
    playList: [],
    playListIndex: -1,
    status: "empty",
    duration: 0,
    currentTime: 0,
    music: {
      album: "",
      artist: "",
      fullpath: "",
      id: -1,
      library: "",
      modified: 0,
      name: "",
      title: "",
      img: "",
      favorite: false,
      hash: ""
    },
    currentMusicIndex: -1
  }),
  mutations: {},
  actions: {
    playMusic: ({ state, dispatch, rootState }, id: number) => {
      state.currentMusicIndex = id;
      state.status = "playing";
      timeTracker && timeTracker.pause();
      const selectedMusic = rootState.library.list[id];

      // const base64src: string = ipcRenderer.sendSync("convert-to-data-url", {
      //   data: readFileSync(selectedMusic.fullpath),
      //   mime: "audio/mp3"
      // });

      const howler = new Howl({
        src: [selectedMusic.fullpath],
        onplayerror: err => {
          console.log(err);
          // pushNotification(state, {
          //   title: "failed to play",
          //   body: `error code : ${err}`,
          //   type: "error"
          // });
        },
        onload: () => {
          state.progress = 0;
          state.duration = howler.duration();
        }
      });

      if (howlerInstance[0]) howlerInstance.splice(0, 1)[0].stop();

      howlerInstance.push(howler);

      howler.volume(state.volume / 100);
      howler.play();

      state.currentTime = 0;
      howler.on("end", () => {
        dispatch("songEnded");
      });

      timeTracker = useIntervalFn(() => {
        dispatch("traceSong");
      }, 1000);
    },

    pauseMusic: ({ state }) => {
      state.status = "paused";
      howlerInstance[0].pause();
      timeTracker.pause();
    },

    resumeMusic: ({ state, dispatch }) => {
      state.status = "playing";

      const audioElement = howlerInstance[0];

      audioElement.play();

      timeTracker = useIntervalFn(() => {
        dispatch("traceSong");
      }, 1000);
    },

    seek: ({ state, dispatch }, progressPrecentage: string | number) => {
      state.progress = Number(progressPrecentage);

      console.log(Number(progressPrecentage));
      howlerInstance[0].seek(
        (Number(progressPrecentage) / 100) * state.duration
      );
      if (timeTracker) timeTracker.pause();

      if (state.status === "playing")
        timeTracker = useIntervalFn(() => {
          dispatch("traceSong");
        }, 1000);
    },
    stopMusic({ state }) {
      howlerInstance[0].stop();
      howlerInstance[0].off("end");
      howlerInstance.splice(0, 1);
      timeTracker.pause();
      state.status = "stopped";
    },
    emptyMusic: ({ state, dispatch }) => {
      dispatch("stopMusic");
      state.status = "empty";
    },

    hideMusicPanel: ({ state }, v: boolean) => {
      state.isVisible = v;
    },
    songEnded: ({ state }) => {
      timeTracker.pause();
      state.status = "finished";
      state.progress = 100;
    },

    traceSong: ({ state }) => {
      state.currentTime = <number>howlerInstance[0].seek();
      const t = <number>howlerInstance[0].seek() / state.duration;
      state.progress = t * 100;
    },

    changeVolume: ({ state }, num: number) => {
      state.volume = num;
      howlerInstance[0].volume(num / 100);
      localStorage.setItem(LocalStorage.volume, String(num));
    }
  },
  getters: {}
};

export default player;
