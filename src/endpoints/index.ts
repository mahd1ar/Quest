import { ipcMain } from "electron";

// home
ipcMain.on("route.home.req", (event, args) => {
  event.returnValue = "HOME";
});
