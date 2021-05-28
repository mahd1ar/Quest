export default interface Message {
  title: string;
  body?: string;
  type: "error" | "log" | "warn" | "success";
  payload?: { [key: string]: any };
}
