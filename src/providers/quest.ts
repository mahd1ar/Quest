import { BrowserWindow } from "electron";
import { Message } from "@/schema";

export namespace Quest {
  function templateFunction(
    title: string,
    body: string,
    type: "error" | "log" | "warn" | "success",
    event?: Electron.IpcMainEvent
  ) {
    const msg: Message = {
      title,
      body,
      type
    };

    if (event) event.reply("quest-notify", event);
    else BrowserWindow.getAllWindows()[0].webContents.send("quest-notify", msg);
  }

  export function alarmAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "log", event);
  }

  export function errorAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "error", event);
  }

  export function successAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "success", event);
  }

  export function warnAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "warn", event);
  }
}
