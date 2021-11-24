// export default interface Notification {
//   id?: number;
//   title: string;
//   body?: string;
//   type?: "error" | "log" | "warn" | "success" | "refresh";
// }

type LogLevel = "error" | "log" | "warn" | "success";
export default interface Notification {
  logLevel: LogLevel;
  message: string;
  payload?: any;
}
