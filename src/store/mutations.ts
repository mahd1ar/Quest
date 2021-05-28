import { State, Music, Notification } from "../schema";
import { ipcRenderer } from "electron";
import { readFileSync } from "fs";
import { remove } from "lodash";
export default {
  seek: (state: State, progressPrecentage: string | number) => {
    const audioElement = document.querySelector(
      "#native-player"
    ) as HTMLAudioElement;

    state.player.progress = Number(progressPrecentage);
    audioElement.currentTime =
      (Number(progressPrecentage) / 100) * state.player.duration;

    if (state.player.status === "playing")
      state.player.currentTimeTracker = Object.freeze(
        window.setInterval(() => {
          state.player.currentTime = audioElement.currentTime;
        }, 1000)
      );
  },
  pauseMusic: (state: State) => {
    state.player.status = "paused";
    if (state.player.pregressTracker)
      clearInterval(state.player.pregressTracker);
    let audioElement = document.querySelector(
      "#native-player"
    ) as HTMLAudioElement;
    audioElement.pause();

    clearInterval(state.player.currentTimeTracker);
  },

  resumeMusic: (state: State) => {
    state.player.status = "playing";

    const audioElement = document.querySelector(
      "#native-player"
    ) as HTMLAudioElement;
    audioElement.play();

    const progressTracker = window.setInterval(() => {
      const t = audioElement!.currentTime / audioElement!.duration;
      state.player.progress = t * 100;
      if (t === 1) clearInterval(progressTracker);
    }, 1000);
    state.player.pregressTracker = Object.freeze(progressTracker);
    state.player.currentTimeTracker = Object.freeze(
      window.setInterval(() => {
        state.player.currentTime = audioElement.currentTime;
      }, 1000)
    );
  },

  playMusic: (state: State, song: Music) => {
    const musicSrc = song.fullpath;
    state.music = song;
    state.player.status = "playing";
    if (state.player.pregressTracker)
      clearInterval(state.player.pregressTracker);

    let audioElement = document.querySelector(
      "#native-player"
    ) as HTMLAudioElement;

    audioElement.pause();

    audioElement.src = ipcRenderer.sendSync("convert-to-data-url", {
      data: readFileSync(musicSrc),
      mime: "audio/mp3"
    });
    audioElement.play();

    audioElement.onloadedmetadata = () => {
      state.player.duration = audioElement!.duration;

      const progressTracker = window.setInterval(() => {
        const t = audioElement!.currentTime / audioElement!.duration;
        state.player.progress = t * 100;
        if (t === 1) {
          clearInterval(progressTracker);
          state.player.status = "finished";
        }
      }, 1000);

      state.player.pregressTracker = Object.freeze(progressTracker);
      state.player.currentTime = 0;
      state.player.currentTimeTracker = Object.freeze(
        window.setInterval(() => {
          state.player.currentTime = audioElement.currentTime;
        }, 1000)
      );
    };
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
