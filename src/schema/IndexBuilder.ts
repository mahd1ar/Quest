import Shadow from "./Shadow";

export default interface IndexBuilder {
  process(music: Shadow, params: any): void;
  createDirectory(): void;
  dump(): void;
}
