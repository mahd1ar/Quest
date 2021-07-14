import { BrowserWindow, ipcMain } from "electron";
import * as Schema from "@/schema";
import { difference } from "lodash";
import path from "path";

export function lastElement<T>(elems: T[]): T {
  return elems[elems.length - 1];
}

export function emptyArray<T>(arr: T[]): void {
  arr.splice(0, arr.length);
}

export function timeout(t: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

export function fillArray<T>(arr1: T[], arr2: T[]): void {
  emptyArray(arr1);
  arr2.forEach(i => {
    arr1.push(i);
  });
}

export class Logger {
  /**
   * error
   */
  public static error(args: string | string[]) {
    BrowserWindow.getAllWindows()[0].webContents.send("quest-error", {
      message: args
    });
  }

  /**
   * log
   */
  public static log(args: string | string[]) {
    console.log(args);
  }
}

export function areDiffrent(a1: string[], a2: string[]) {
  // console.log("***********")
  // const x = difference(a1, a2)
  // const y = difference(a2, a1)
  // console.log(x, y)
  // console.log("***********")
  return !(difference(a1, a2).length === 0 && difference(a2, a1).length === 0);
}

export function normalPath(args: string[]) {
  const res = path.normalize(args.join(path.sep));

  if (res[res.length - 1] == "/") res.substring(0, res.length - 1);

  return res;
}
