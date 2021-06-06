import { State, Music, Notification } from "../schema";
import { ipcRenderer } from "electron";
import { readFileSync } from "fs";
import { remove } from "lodash";
import { Howl, Howler } from "howler";

const howlerInstance: Howl[] = [];

export default {
  seek: (state: State, progressPrecentage: string | number) => {
    const audioElement = howlerInstance[0];
    state.player.progress = Number(progressPrecentage);

    console.log((Number(progressPrecentage) / 100) * state.player.duration);
    audioElement.seek(
      (Number(progressPrecentage) / 100) * state.player.duration
    );

    if (state.player.status === "playing")
      state.player.currentTimeTracker = Object.freeze(
        window.setInterval(() => {
          state.player.currentTime = <number>audioElement.seek();
          if (<number>audioElement.seek() === audioElement.duration()) {
            clearInterval(state.player.currentTimeTracker);
            state.player.status = "finished";
          }
        }, 1000)
      );
  },
  pauseMusic: (state: State) => {
    state.player.status = "paused";

    howlerInstance[0].pause();

    clearInterval(state.player.currentTimeTracker);
  },

  resumeMusic: (state: State) => {
    state.player.status = "playing";

    const audioElement = howlerInstance[0];

    audioElement.play();

    const currentTimeTracker = window.setInterval(() => {
      state.player.currentTime = <number>audioElement.seek();
      const t = <number>audioElement.seek() / state.player.duration;
      state.player.progress = t * 100;
      if (t === 1) {
        clearInterval(currentTimeTracker);
        state.player.status = "finished";
      }
    }, 1000);

    state.player.currentTimeTracker = Object.freeze(currentTimeTracker);
  },

  playMusic: (state: State, song: Music) => {
    const musicSrc = song.fullpath;
    state.music = song;
    state.player.status = "playing";
    if (state.player.pregressTracker)
      clearInterval(state.player.pregressTracker);

    const base64src: string = ipcRenderer.sendSync("convert-to-data-url", {
      data: readFileSync(musicSrc),
      mime: "audio/mp3"
    });

    const howler = new Howl({
      src: [base64src],
      onplayerror: err => {
        console.log(err);
      },
      onload: () => {
        console.log(0);
        state.player.progress = 0;
        state.player.duration = howler.duration();
      }
    });

    if (howlerInstance[0]) howlerInstance.splice(0, 1)[0].stop();

    howlerInstance.push(howler);

    howler.volume(state.player.volume / 100);
    howler.play();

    state.player.currentTime = 0;
    const currentTimeTracker = window.setInterval(() => {
      state.player.currentTime = <number>howler.seek();
      const t = <number>howler.seek() / state.player.duration;
      state.player.progress = t * 100;
      if (t === 1) {
        clearInterval(currentTimeTracker);
        state.player.status = "finished";
      }
    }, 1000);

    state.player.currentTimeTracker = Object.freeze(currentTimeTracker);
  },

  changeVolume(state: State, num: number) {
    console.log({ num });
    state.player.volume = num;
    howlerInstance[0].volume(num / 100);
    localStorage.setItem("quest.player.volume", String(num));
  },

  pushNotification: (state: State, notif: Notification): number => {
    if (!notif.id) notif.id = Math.random();

    setTimeout(() => {
      remove(state.notifications, i => i.id === notif.id);
    }, 3800);

    state.notifications.push(notif);
    return notif.id;
  },

  removeNotification: (state: State, id: number) => {
    remove(state.notifications, i => i.id === id);
  }
};
