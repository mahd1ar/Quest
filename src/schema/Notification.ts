export default interface Notification {
  id?: number;
  title: string;
  body?: string;
  type?: "error" | "log" | "warn" | "success";
}
