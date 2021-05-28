import { MainQueue, Task } from "./utilities";
import { ipcMain } from "electron";
import { Message } from "@/schema";
import { Quest } from "./quest";
// router wrapper
export function route(
  routeValue: string,
  queue: MainQueue,
  callback: (...args: any[]) => any
) {
  const routeValueReq = `route.${routeValue}.req`;
  const routeValueRes = `route.${routeValue}.res`;

  ipcMain.on(routeValueReq, event => {
    new Task(queue, task => {
      try {
        const responce = callback();

        responder(responce, (e: any) => {
          event.reply(routeValueRes, e);
        });
      } catch (error) {
        Quest.errorAsync("An error occurred", String(error), event);
      } finally {
        task.done();
      }
    }).ready();
  });
}

function responder<T>(
  argument: T | Array<T> | Promise<T>[] | Promise<T>,
  callback: Function
) {
  if (Array.isArray(argument) && isArrayOfPromomises(argument)) {
    Promise.all(argument).then(i => {
      callback(i);
    });
    return;
  }

  if (argument instanceof Promise) {
    argument.then(i => {
      callback(i);
    });
    return;
  }
  callback(argument);
}

function isArrayOfPromomises<T>(
  args: T[] | Promise<T>[]
): args is Promise<T>[] {
  return args.every((i: any) => i instanceof Promise);
}
