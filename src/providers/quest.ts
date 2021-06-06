import { BrowserWindow } from "electron";
import { Message } from "@/schema";

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

export class Quest {
  static alarmAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "log", event);
  }

  static errorAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "error", event);
  }

  static successAsync(
    title: string,
    body: string,
    event?: Electron.IpcMainEvent
  ) {
    templateFunction(title, body, "success", event);
  }

  static warnAsync(title: string, body: string, event?: Electron.IpcMainEvent) {
    templateFunction(title, body, "warn", event);
  }
}
