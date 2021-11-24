import _SimpleList from "./_SimpleList";

export default class Favorites extends _SimpleList {
  FILE_NAME: string = "favorites";
  MAX_RECORD: number = -1;

  constructor() {
    super();
  }
}
