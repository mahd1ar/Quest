// constants
export const UNKNOWN_ALBUM = "unknown album";
export const UNKNOWN_TITLE = "unknown title";
export const UNKNOWN_ARTIST = "unknown artist";
export const UNKNOWN_IMG = `data:image/jpeg;base64,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`;
export enum Storage {
  Libraries = "quest-user-libraries"
}
