import { route } from "@/providers/routerWrapper";
import { RecentlyPlayedBuilder, AlbumBuilder } from "@/database";
import { MainQueue } from "@/providers/utilities";

export function initRoutes(questQueue: MainQueue) {
  route("recently_played.get", questQueue, () => {
    let recently = new RecentlyPlayedBuilder();
    return recently.get();
  });

  route("albums", questQueue, async () => {
    let albums = new AlbumBuilder();
    return Promise.all(await albums.ls());
  });

  route("album_select", questQueue, async x => {
    console.log(x);
    let albums = new AlbumBuilder();
    return Promise.all(await albums.ls());
  });

  route("recently_played.set", questQueue, params => {
    let recently = new RecentlyPlayedBuilder();
    recently.process(
      {
        id: params.payload!.musicid,
        album: "",
        artist: "",
        fullpath: "",
        library: "",
        modified: 0,
        name: "",
        title: ""
      },
      undefined
    );
  });
}
