import { State, Music, Notification } from "../schema";
import { ipcRenderer } from "electron";
import { readFileSync } from "fs";
import { remove, difference } from "lodash";
import { Howl, Howler } from "howler";
import { fillArray } from "@/helpers";
import { useIntervalFn, Pausable } from "@vueuse/core";

const howlerInstance: Howl[] = [];

let timeTracker: Pausable;

const songEnded = (state: State) => {

  timeTracker.pause()
  state.player.status = "finished";
  state.player.progress = 100;
}

const traceSong = (state: State, audioElement: Howl) => {

  state.player.currentTime = <number>audioElement.seek();
  const t = <number>audioElement.seek() / state.player.duration;
  state.player.progress = t * 100;
  // on finished ...
  // if (<number>audioElement.seek() + 1 > audioElement.duration()) {
  //   timeTracker.pause();

  //   state.player.status = "finished";
  // }
  console.log("t:", t)
}

const seek = (state: State, progressPrecentage: string | number) => {
  const audioElement = howlerInstance[0];
  state.player.progress = Number(progressPrecentage);

  console.log(Number(progressPrecentage));
  audioElement.seek((Number(progressPrecentage) / 100) * state.player.duration);
  if (timeTracker)
    timeTracker.pause()

  if (state.player.status === "playing")
    timeTracker = useIntervalFn(() => {
      traceSong(state, audioElement)
    }, 1000);

};

const pauseMusic = (state: State) => {
  state.player.status = "paused";

  howlerInstance[0].pause();
  timeTracker.pause();
};

const resumeMusic = (state: State) => {
  state.player.status = "playing";

  const audioElement = howlerInstance[0];

  audioElement.play();

  timeTracker = useIntervalFn(() => {
    traceSong(state, audioElement)
  }, 1000);
};

const playMusic = (state: State, song: Music) => {
  Object.assign(state.music, song);

  state.player.status = "playing";
  timeTracker && timeTracker.pause();

  // const base64src: string = ipcRenderer.sendSync("convert-to-data-url", {
  //   data: readFileSync(state.music.fullpath),
  //   mime: "audio/mp3"
  // });

  const howler = new Howl({
    src: [state.music.fullpath],
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



  // const canvas = document.querySelector("canvas") as HTMLCanvasElement
  // const analyser = Howler.ctx.createAnalyser()
  // // Connect the masterGain -> analyser (disconnecting masterGain -> destination)
  // Howler.masterGain.connect(analyser);

  // // Connect the analyser -> destination
  // analyser.connect(Howler.ctx.destination);

  // let ctx = canvas.getContext("2d");
  // analyser.fftSize = 2048;
  // let data = new Uint8Array(analyser.frequencyBinCount);





  if (howlerInstance[0]) howlerInstance.splice(0, 1)[0].stop();

  howlerInstance.push(howler);

  howler.volume(state.player.volume / 100);
  howler.play();

  state.player.currentTime = 0;
  howler.on("end", () => {
    songEnded(state)
  })

  timeTracker = useIntervalFn(() => {
    traceSong(state, howler)
  }, 1000);
};

const stopMusic = (state: State) => {
  howlerInstance[0].stop();
  howlerInstance[0].off("end")
  howlerInstance.splice(0, 1);
  timeTracker.pause();
  state.player.status = "stopped";
};

const emptyMusic = (state: State) => {
  stopMusic(state);
  state.player.status = "empty";
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

    fillArray(state.libraries, values);
    // localStorage.setItem("quest-user-libraries", JSON.stringify(values));
  }
};

const addToQueue = (state: State, values: Music[]) => {
  //@ts-ignore
  state.player.playList.splice(0, state.player.playList.length)
  values.forEach((v: Music) => {

    state.player.playList.push(v);
  })
  // state.player.playList[0] = values[0]
  state.player.playListIndex = 0;

  playMusic(state, values[0]);
};

const clearQueue = (state: State) => {
  state.player.playList.splice(0, state.player.playList.length)
}


const nextSong = (state: State) => {
  state.player.playListIndex++
  playMusic(state, state.player.playList[state.player.playListIndex])
};


export default {
  seek,
  nextSong,
  addToQueue,
  clearQueue,
  pauseMusic,
  resumeMusic,
  playMusic,
  stopMusic,
  emptyMusic,
  changeVolume,
  pushNotification,
  removeNotification,
  toggleHeart,
  changeLibraries
};
