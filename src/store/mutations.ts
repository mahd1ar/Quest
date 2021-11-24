import { State, Music, Notification } from "../schema";
import { ipcRenderer } from "electron";
import { readFileSync } from "fs";
import { remove, difference } from "lodash";
import { Howl, Howler } from "howler";
import { fillArray } from "@/helpers";
import { useIntervalFn, Pausable } from "@vueuse/core";

const howlerInstance: Howl[] = [];

let timeTracker: Pausable;

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

const addToQueue = (state: State, values: string[]) => {
  fillArray(state.player.playList, values);
  state.player.playListIndex = 0;
};

const clearQueue = (state: State) => {
  console.log("CLREAR");
  state.player.playList.splice(0, state.player.playList.length);
  state.player.playListIndex = -1;
};

const nextSong = (state: State) => {
  state.player.playListIndex++;
};
const previousSong = (state: State) => {
  state.player.playListIndex--;
};

const canvasUnmounted = (state: State) => {
  // cancelAnimationFrame(reqAnimation);
  state.canvas.status = false;
};

const canvasMounted = (state: State) => {
  // const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  // const canvasCtx = canvas.getContext("2d")!;
  // if (!Howler.ctx) return;
  // const analyser = Howler.ctx.createAnalyser();
  // analyser.fftSize = 2048;
  // // Connect the masterGain -> analyser (disconnecting masterGain -> destination)
  // Howler.masterGain.connect(analyser);

  // // Connect the analyser -> destination
  // analyser.connect(Howler.ctx.destination);

  // const bufferLength = analyser.frequencyBinCount;

  // const dataArray = new Uint8Array(bufferLength);
  // // let data = new Uint8Array(analyser.frequencyBinCount);

  // function draw() {
  //   reqAnimation = requestAnimationFrame(draw);
  //   analyser.getByteTimeDomainData(dataArray);

  //   canvasCtx.fillStyle = "rgb(200, 200, 200)";
  //   canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  //   canvasCtx.lineWidth = 2;
  //   canvasCtx.strokeStyle = `rgb(33, 10, 30)`;

  //   canvasCtx.beginPath();

  //   const sliceWidth = (canvas.width * 1.0) / bufferLength;
  //   let x = 0;

  //   for (let i = 0; i < bufferLength; i++) {
  //     const v = dataArray[i] / 128.0;
  //     const y = (v * canvas.height) / 2;

  //     if (i === 0) {
  //       canvasCtx.moveTo(x, y);
  //     } else {
  //       canvasCtx.lineTo(x, y);
  //     }

  //     x += sliceWidth;
  //   }

  //   canvasCtx.lineTo(canvas.width, canvas.height / 2);
  //   canvasCtx.stroke();
  // }
  // draw();
  state.canvas.status = true;
};
