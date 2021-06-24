import { ipcRenderer } from "electron";
import { findIndex } from "lodash";

function getAverageRGB(imgEl: HTMLImageElement) {
  const blockSize = 5; // only visit every 5 pixels
  const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
  const canvas = document.createElement("canvas");
  const context = canvas.getContext && canvas.getContext("2d");
  let data;
  let i = -4;
  const rgb = { r: 0, g: 0, b: 0 };
  let count = 0;

  if (!context) {
    return defaultRGB;
  }
  const height = (canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height);
  const width = (canvas.width =
    imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width);

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB;
  }

  const length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

class Listener {
  private elements: {
    name: string;
    endpoint: string;
    action: Function;
    emitOnLoad: boolean;
    payload?: object;
  }[] = [];

  constructor() {}

  register(
    name: string,
    endpoint: string,
    action: Function,
    emitOnLoad: boolean = true,
    payload?: object
  ) {
    this.elements.push({ name, endpoint, action, emitOnLoad, payload });
    return this;
  }

  emit(index: string | number, payload?: object) {
    if (typeof index === "string") {
      this.sendAsync(
        findIndex(this.elements, i => i.name === index),
        payload
      );
    } else if (typeof index === "number") {
      if (index !== -1) this.sendAsync(index, payload);
      else this.sendAsync(this.elements.length - 1, payload);
    }
  }

  get() {
    return this.elements;
  }

  unbindAll() {
    this.elements.forEach(element => {
      ipcRenderer.removeAllListeners(element.endpoint + ".res");
    });
  }

  private sendAsync(index: number, payload?: object) {
    if (payload) this.elements[index].payload = payload;

    if (!this.elements[index].payload)
      ipcRenderer.send(this.elements[index].endpoint + ".req");
    else {
      ipcRenderer.send(
        this.elements[index].endpoint + ".req",
        this.elements[index].payload
      );
    }
  }
}

export { getAverageRGB, Listener };
