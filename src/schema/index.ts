import Music from "./Music";
import VuexState from "./VuexState";
import Notification from "./Notification";
import Shadow from "./Shadow";
import ID3 from "./ID3";

interface ImageManagerBufferType {
  name: string;
  address: string;
  createdAt: number;
}

type Events = {
  veilup: boolean;
  veilDark: boolean;
  overlay: {
    ttl?: number;
    status: boolean;
    bgColor?: string;
    callback?: () => void;
  };
};

interface DBControllerProps {
  FILE_NAME: string;
  MAX_RECORD: number;
}

interface DbOprations<T> {
  all(): T[];
  find(filter: { [id: string]: T }): T[];
  get(id: string): T | false;
  create(val: T): string | false;
  update(filter: { [id: string]: T }): T | T[];
  // patch:
  remove(filter: { [id: string]: T }): T[];
}

export {
  VuexState,
  DBControllerProps,
  Events,
  Music,
  ID3,
  DbOprations,
  // IndexBuilder,
  // CategoryBuilder,
  // CategoryTypes,
  // FileBuilder,
  // Message,
  Notification,
  Shadow,
  ImageManagerBufferType
};
