import { MainQueue, Task } from "./utilities";
import { ipcMain } from "electron";
import { Quest } from "./quest";
import { resolve } from "path";
// router wrapper
export function route(
  routeValue: string,
  queue: MainQueue,
  callback: (params: { [key: string]: any }) => any
) {
  // const routeValueReq = routeValue + `.req`;
  // const routeValueRes = routeValue + `.res`;

  ipcMain.handle(routeValue, (event, params) => {
    return new Promise(resolve => {
      new Task(queue, task => {
        // try {
        const responce = callback(params);
        responder(responce, (e: any) => {
          resolve(e);
        });
        // } catch (error) {
        //   Quest.errorAsync("An error occurred", String(error), event);
        // } finally {
        task.done();
        // }
      }).ready();
    });
  });
}

function responder<T>(
  argument: T | Array<T> | Promise<T>[] | Promise<T>,
  callback: Function
) {
  if (Array.isArray(argument) && isArrayOfPromomises(argument)) {
    Promise.allSettled(argument).then(response => {
      const fulfilled = response.filter(i => i.status === "fulfilled");

      callback((<PromiseFulfilledResult<T>[]>fulfilled).map(i => i.value));

      response
        .filter(i => i.status === "rejected")
        .forEach(i => {
          Quest.errorAsync(
            "An error occurred",
            (<PromiseRejectedResult>i).reason
          );
          Quest.Log(
            "PromiseRejectedResult -> " + (<PromiseRejectedResult>i).reason,
            "error"
          );
        });
    });
    return;
  }

  if (argument instanceof Promise) {
    argument
      .then(i => {
        callback(i);
      })
      .catch(error => {
        Quest.errorAsync("An error occurred", error);
        Quest.Log("PromiseRejectedResult -> " + error, "error");
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
