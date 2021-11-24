import { ipcMain } from "electron";

ipcMain.handle("database.delete", async (event, ...args) => {
  // const result = await somePromise(...args)
  console.log(...args);
  return "result";
});

ipcMain.handle("database.make", async (event, ...args) => {
  // const result = await somePromise(...args)
  console.log(...args);
  return "result";
});

