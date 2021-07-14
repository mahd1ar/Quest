import { route } from "@/providers/routerWrapper";
import {
  Category,
  RecentlyAddedBuilder,
  Favorites,
  ImageManager
} from "@/database";
import { MainQueue } from "@/providers/utilities";
import { CategoryTypes } from "@/schema";

export function initRoutes(questQueue: MainQueue) {
  route("recently_played.get", questQueue, () => {
    const recently = new RecentlyAddedBuilder();
    return recently.get().map(i => recently.getMusic(i));
  });

  route("albums", questQueue, () => {
    const albums = new Category("album");

    return albums.ls().map(async name => {
      const image = (await albums.getMusic(albums.get(name)[0])).img;

      return { name, image };
    });
  });

  route("albums/ls", questQueue, () => {
    const cat = new Category("album");

    return cat.ls().map(async name => {
      const x = await cat.getMusic(cat.get(name)[0]);

      return { name, image: x.img, description: "by " + x.artist };
    });
  });

  route("artists/ls", questQueue, () => {
    const cat = new Category("artist");

    return cat.ls().map(async name => {
      const image = (await cat.getMusic(cat.get(name)[0])).img;
      console.log(name);
      return { name, image };
    });
  });

  route("category", questQueue, params => {
    const categoryType: CategoryTypes = params.payload!.categoryType;
    const categoryName: string = params.payload!.categoryName;

    console.log({ categoryName }, { categoryType });
    const cat = new Category(categoryType);

    return cat.get(categoryName).map(i => cat.getMusic(i, false));
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

  route("api/artist", questQueue, params => {
    const imgMamt = new ImageManager();

    const allPromises = (<string[]>params).map(artistname => {
      return imgMamt.findOrFetch(artistname);
    });

    Promise.allSettled(allPromises).then(() => {
      imgMamt.persist();
    });

    return allPromises;
  });
}
