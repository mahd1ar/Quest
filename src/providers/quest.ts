import { BrowserWindow } from "electron";
import { Message } from "@/schema";
import fs from "fs";
import path from "path";

type LogLevel = "error" | "log" | "warn" | "success";

function templateFunction(
  title: string,
  body: string,
  type: LogLevel,
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

  static Log(message: string | any[] | object | number, logLevel: LogLevel) {
    let pre = Date() + " :: " + logLevel + " :: ";
    pre +=
      typeof message === "string" || typeof message === "number"
        ? message
        : JSON.stringify(message);

    pre += "\n";

    fs.appendFile(
      path.join(global.questUserData, "/database/logs.txt"),
      pre,
      err => {
        if (err) console.error(err);
      }
    );
  }
}
