declare const __static: string;

import fs from "fs";
import path from "path";
import { DBControllerProps } from "@/schema";

export default abstract class _FileDataBase<dataSchema>
  implements DBControllerProps {
  abstract FILE_NAME: string;
  abstract MAX_RECORD: number;
  // private basePath = path.join(global.questUserData, "/database");
  private basePath = path.join(__static, "/database");

  get fullpath() {
    return path.join(this.basePath, this.FILE_NAME);
  }

  constructor() {
    if (!fs.existsSync(this.basePath)) fs.mkdirSync(this.basePath);
  }

  abstract fileProcessor(planetxt: string): dataSchema[];
  abstract fileGenerator(data: dataSchema[]): string;

  private handledError(e: { err: Error; message: string }) {
    console.error("[E] FileDataBase.loads error", e.message, e.err);
  }

  protected read() {
    try {
      if (!fs.existsSync(this.fullpath)) {
        return this.fileProcessor("");
      }
      const x = fs.readFileSync(this.fullpath).toString();
      return this.fileProcessor(x);
    } catch (error) {
      this.handledError({ err: error, message: "cannot access to file" });
      return false;
    }
  }

  protected write(data: dataSchema[]) {
    try {
      fs.writeFileSync(this.fullpath, this.fileGenerator(data));
      return true;
    } catch (error) {
      this.handledError({ err: error, message: ">>cannont write to file<<" });
      return false;
    }
  }

  // abstract find(): dataSchema[] | dataSchema;
  // abstract get(id: string): dataSchema | false;
  // abstract delete(id: string): boolean;
  // abstract all(): dataSchema[];
}
