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

export function areDiffrent(a1: string[], a2: string[]) {
  return !(difference(a1, a2).length === 0 && difference(a2, a1).length === 0);
}

export function normalPath(args: string[]) {
  const res = path.normalize(args.join(path.sep));

  if (res[res.length - 1] == "/") res.substring(0, res.length - 1);

  return res;
}

export const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
