import _FileDataBase from "./_FileDataBase";
import { remove } from "lodash";
import { DbOprations } from "@/schema";

export default abstract class _SimpleList extends _FileDataBase<string>
  implements DbOprations<string> {
  constructor() {
    super();
  }

  all(): string[] {
    return this.read();
  }
  find(filter: { [id: string]: string }): string[] {
    const data = this.read();

    const values = Object.values(filter);
    return data.filter(d => values.includes(d));
  }

  get(id: string): string | false {
    const data = this.read();
    return data.find(d => d === id) || false;
  }
  create(val: string): string | false {
    const data = this.read();

    if (!data.includes(val)) {
      const idx = data.push(val);
      return String(idx);
    } else {
      return false;
    }
  }
  update(filter: { [id: string]: string }): string[] {
    throw new Error("Method not implemented.");
  }
  remove(filter: { [id: string]: string }): string[] {
    const data = this.read();

    const values = Object.values(filter);

    const res = remove(data, d => values.includes(d));
    this.write(data);
    return res;
  }
}
