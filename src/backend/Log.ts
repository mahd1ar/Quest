import fs from "fs";
import path from "path";
import { Notification } from "@/schema";

type LogInput = Notification | string | number | number[] | string[] | Error; // add general object type
// [key: string ]: number | string;

export default class Log {
  static osNotification(input: LogInput) {
    const x = Log.normalize(input);
    // Log.println( );
  }

  static chromiumNotification(input: LogInput) {
    const x = Log.normalize(input);
    // do
  }

  // static notify(n: Notification | string) {
  //   // NOTIFY FRONTEND &
  // }
  static println(n: Notification) {
    switch (n.logLevel) {
      case "error":
        console.error(n);
        break;
      case "success":
        console.log("Success**", n);
        break;
      case "warn":
        console.warn(n);
        break;
      case "log":
        console.log(n);
        break;
    }
  }
  static record(n: Notification) {
    let pre = Date() + " :: " + n.logLevel || "log" + " :: " + n.message + "\n";

    if (n.payload instanceof Error) pre += String(Error);

    fs.appendFile(
      path.join(global.questUserData, "/database/logs.txt"),
      pre,
      err => {
        if (err) console.error(err);
      }
    );
  }

  private static normalize(n: LogInput) {
    const x = { logLevel: "log" } as Notification;

    if (Array.isArray(n)) {
      x.message = n.join(", ");
      return x;
    }

    if (typeof n === "string" || typeof n === "number") {
      x.message = String(n);
      return x;
    }

    if (n instanceof Error) {
      x.logLevel = "error";
      x.message = "an error happend";
      x.payload = n;
      return x;
    }

    return n;
  }
}
