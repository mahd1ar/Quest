import { DBControllerProps } from "@/schema";

export default abstract class _FileDataBase<dataSchema>
  implements DBControllerProps {
  abstract FILE_NAME: string;
  abstract MAX_RECORD: number;

  private data: dataSchema[] = [];
  private isLoaded = false;
  public load() {
    this.unload();
    this.isLoaded = true;
    this.read().forEach(i => {
      this.data.push(i);
    });
  }
  public unload() {
    this.isLoaded = false;
    this.data.splice(0, this.data.length);
  }
  protected read() {
    if (this.isLoaded === false) {
      console.log("read operation");
      const x: dataSchema[] = JSON.parse(
        localStorage.getItem(this.FILE_NAME) || "[]"
      );
      return x;
    } else {
      return this.data;
    }
  }

  protected write(data?: dataSchema[]) {
    if (data === undefined)
      if (this.isLoaded === true) data = this.data;
      else {
        console.error("threr is no data");
        data = [];
      }

    if (this.MAX_RECORD > 0) data = data.slice(0, this.MAX_RECORD);

    localStorage.setItem(this.FILE_NAME, JSON.stringify(data));

    this.unload();
  }
}
