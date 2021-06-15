import { route } from "@/providers/routerWrapper";
import { Category, RecentlyAddedBuilder, Favorites } from "@/database";
import { MainQueue } from "@/providers/utilities";
import { CategoryTypes } from "@/schema";

export function initRoutes(questQueue: MainQueue) {
  route("recently_played.get", questQueue, () => {
    let recently = new RecentlyAddedBuilder();
    return recently.get().map(i => recently.getMusic(i));
  });

  route("albums", questQueue, () => {
    let albums = new Category("album");

    return albums.ls().map(async name => {
      const image = (await albums.getMusic(albums.get(name)[0])).img;

      return { name, image };
    });
  });

  route("category", questQueue, params => {
    console.log(params);
    const categoryType: CategoryTypes = params.payload!.categoryType;
    const categoryName: string = params.payload!.categoryName;

    console.log({ categoryName }, { categoryType });
    let cat = new Category(categoryType);

    return cat.get(categoryName).map(i => cat.getMusic(i));
  });

  route("favorite/all", questQueue, () => {
    const favs = new Favorites();
    return favs.read();
  });

  route("favorite/set", questQueue, ({ payload }) => {
    let success = true;
    try {
      console.log("favorite/set", payload);
      const favs = new Favorites();
      favs.record(payload!.id, payload!.fullpath, payload!.value);
    } catch (error) {
      success = false;
    }
    console.log({ success });
    return success;
  });

  // route("album_select", questQueue, async x => {
  //   x.payload!.albumname = "unknown";
  //   let albums = new Category("album", "csv", x.payload!.albumname);
  //   return Promise.all(await albums.ls());
  // });

  // route("recently_played.set", questQueue, params => {
  //   let recently = new RecentlyPlayedBuilder();
  //   recently.process(
  //     {
  //       id: params.payload!.musicid,
  //       album: "",
  //       artist: "",
  //       fullpath: "",
  //       library: "",
  //       modified: 0,
  //       name: "",
  //       title: ""
  //     },
  //     undefined
  //   );
  // });
}
