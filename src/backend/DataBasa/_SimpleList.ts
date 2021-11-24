import _FileDataBase from "./_FileDataBase";
import { remove, fill } from "lodash";
import { DbOprations } from "@/schema";

export default abstract class _SimpleList extends _FileDataBase<string>
  implements DbOprations<string> {
  constructor() {
    super();
  }

  all(): string[] {
    const d = this.read();
    return d === false ? [] : d;
  }
  find(filter: { [id: string]: string }): string[] {
    throw new Error("Method not implemented.");
  }

  get(id: string): string | false {
    const data = this.read();
    return data !== false ? data.find(d => d === id) || false : false;
  }
  create(val: string): string | false {
    throw new Error("Method not implemented.");
  }
  update(filter: { [id: string]: string }): string[] {
    const data = this.read();
    if (data === false) return [];
    const values = Object.values(filter);
    return data.filter(d => values.includes(d));
  }
  remove(filter: { [id: string]: string }): string[] {
    const data = this.read();
    if (data === false) return [];
    const values = Object.values(filter);

    const res = remove(data, d => values.includes(d));
    return this.write(data) ? res : [];
  }

  fileProcessor(planetxt: string): string[] {
    const s = new Set<string>();

    planetxt
      .split("\n")
      .filter(Boolean)
      .forEach(line => s.add(line.trim()));

    return Array.from(s);
  }
  fileGenerator(data: string[]): string {
    return data.reduce((total, d) => {
      return (total += d + "\n");
    }, "");
  }
}
