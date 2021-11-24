import chokidar from "chokidar";
import { emptyArray } from "@/helpers";
import { remove } from "lodash";

export default abstract class _watch {
  private watchers: { path: string; chokidar: chokidar.FSWatcher }[] = [];
  constructor(private libs: string[]) {
    this.start();
  }

  public start() {
    this.libs.forEach(path => {
      this.watchDirectory(path);
    });
  }

  abstract addedHook(params: {
    directory: string;
    newFile: string;
  }): void | Promise<void>;

  abstract removedHook(params: {
    directory: string;
    newFile: string;
  }): void | Promise<void>;

  private watchDirectory(directory: string) {
    const w = chokidar
      .watch(directory, {
        //   depth: 0,
        ignoreInitial: true,
        awaitWriteFinish: true
      })
      .on("all", (event, param) => {
        console.log({ param });
        if (event === "unlinkDir" || event === "addDir") {
          console.log("EVENT IGNORED");
          return;
        }
        console.log("event fired!!", event);
        // calback(event);
        if (event === "add") this.addedHook({ directory, newFile: param });

        if (event === "unlink") this.removedHook({ directory, newFile: param });
      });

    this.watchers.push({ path: directory, chokidar: w });
  }

  public removeDir() {}

  public addDir() {}

  public unwatchDir(directory: string) {
    const x = remove(this.watchers, lib => lib.path === directory);
    x[0].chokidar.close();
  }

  public close() {
    this.watchers.forEach(w => w.chokidar.close());
    emptyArray(this.watchers);
  }
}
