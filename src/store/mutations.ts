import { State, Music, Notification } from "../schema";
import { ipcRenderer } from "electron";
import { readFileSync } from "fs";
import { remove, difference } from "lodash";
import { Howl, Howler } from "howler";
import { emptyAndFillArray } from "@/helpers";

const howlerInstance: Howl[] = [];
let currentTimeTracker: number;

// function timeTrackerFn() {

// }

const seek = (state: State, progressPrecentage: string | number) => {
  const audioElement = howlerInstance[0];
  state.player.progress = Number(progressPrecentage);

  console.log((Number(progressPrecentage) / 100) * state.player.duration);
  audioElement.seek((Number(progressPrecentage) / 100) * state.player.duration);

  if (state.player.status === "playing")
    currentTimeTracker = window.setInterval(() => {
      state.player.currentTime = <number>audioElement.seek();
      if (<number>audioElement.seek() === audioElement.duration()) {
        clearInterval(currentTimeTracker);
        state.player.status = "finished";
      }
    }, 1000);
};

const pauseMusic = (state: State) => {
  state.player.status = "paused";

  howlerInstance[0].pause();

  clearInterval(currentTimeTracker);
};

const resumeMusic = (state: State) => {
  state.player.status = "playing";

  const audioElement = howlerInstance[0];

  audioElement.play();

  const timeTracker = window.setInterval(() => {
    state.player.currentTime = <number>audioElement.seek();
    const t = <number>audioElement.seek() / state.player.duration;
    state.player.progress = t * 100;
    if (t === 1) {
      clearInterval(currentTimeTracker);
      state.player.status = "finished";
    }
  }, 1000);

  currentTimeTracker = timeTracker;
};

const playMusic = (state: State, song: Music) => {
  const musicSrc = song.fullpath;
  // for(let i of Object.keys( state.music))
  // state.music[i] = song[i];

  // Object.keys( state.music).forEach(i=>{
  //   state.music[i] = song[i];
  // })

  Object.assign(state.music, song);

  state.player.status = "playing";

  clearInterval(currentTimeTracker);

  const base64src: string = ipcRenderer.sendSync("convert-to-data-url", {
    data: readFileSync(musicSrc),
    mime: "audio/mp3"
  });

  const howler = new Howl({
    src: [base64src],
    onplayerror: err => {
      console.log(err);
      pushNotification(state, {
        title: "failed to play",
        body: `error code : ${err}`,
        type: "error"
      });
    },
    onload: () => {
      state.player.progress = 0;
      state.player.duration = howler.duration();
    }
  });

  if (howlerInstance[0]) howlerInstance.splice(0, 1)[0].stop();

  howlerInstance.push(howler);

  howler.volume(state.player.volume / 100);
  howler.play();

  state.player.currentTime = 0;
  const timeTracker = window.setInterval(() => {
    state.player.currentTime = <number>howler.seek();
    const t = <number>howler.seek() / state.player.duration;
    state.player.progress = t * 100;
    if (t === 1) {
      clearInterval(currentTimeTracker);
      state.player.status = "finished";
    }
  }, 1000);

  currentTimeTracker = timeTracker;
};

const changeVolume = (state: State, num: number) => {
  state.player.volume = num;
  howlerInstance[0].volume(num / 100);
  localStorage.setItem("quest.player.volume", String(num));
};

const pushNotification = (state: State, notif: Notification): number => {
  if (!notif.id) notif.id = Math.random();

  setTimeout(() => {
    remove(state.notifications, i => i.id === notif.id);
  }, 3800);

  state.notifications.push(notif);
  return notif.id;
};

const removeNotification = (state: State, id: number) => {
  remove(state.notifications, i => i.id === id);
};

const toggleHeart = (state: State, value: boolean | undefined) => {
  if (value) {
    state.music.favorite = value;
  } else {
    state.music.favorite = !state.music.favorite;
  }
};

const changeLibraries = (state: State, values: string[]) => {
  const rightDiff = difference(state.libraries, values);
  const leftDiff = difference(values, state.libraries);

  if (rightDiff.length != 0 || leftDiff.length != 0) {
    if (rightDiff.length !== 0) {
      pushNotification(state, {
        title: "library deleted",
        type: "error",
        body: rightDiff.join("\n") + " removed"
      } as Notification);
    }

    if (leftDiff.length !== 0) {
      pushNotification(state, {
        title: "new library added",
        type: "success",
        body: leftDiff.join("\n") + " added"
      } as Notification);
    }

    emptyAndFillArray(state.libraries, values);
    localStorage.setItem("quest-user-libraries", JSON.stringify(values));
  }
};

export default {
  seek,
  pauseMusic,
  resumeMusic,
  playMusic,
  changeVolume,
  pushNotification,
  removeNotification,
  toggleHeart,
  changeLibraries
};
