<template>
  <main
    class="bg-gray-800 text-center text-white w-full overflow-y-scroll relative"
  >
    <div ref="gradient_pl" class="text-left p-8 transition-all delay-200">
      <!-- bg-gradient-to-b from-green-500  -->
      <!-- card -->
      <h2 class="text-3xl capitalize">good evening</h2>
      <div class="my-6 flex flex-wrap">
        <div
          v-for="music in recentlyAdded"
          :key="music.id"
          @click="playMusic(music)"
          class="sm:w-6/12 lg:w-1/3 xl:w-1/4"
        >
          <!-- @mouseover="mouseOver(index)"
          @mouseleave="mouseLeave"-->
          <div class="p-1">
            <span
              class="bg-gray-600 bg-opacity-40 flex items-center rounded-md"
            >
              <img
                class="rounded-l-md w-28 h-28 object-cover"
                :src="music.img"
              />
              <span
                class="capitalize pl-4 py-2 h-28 font-bold text-white flex items-center overflow-hidden"
              >
                <div class="_3-line-3-dots font-roboto text-lg">
                  {{ music.title }}
                </div>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Albums -->

    <div class="text-left p-8">
      <h2 class="text-3xl capitalize my-6 px-3" v-show="albums.length > 0">
        Albums
      </h2>
      <div class="flex overflow-x-hidden">
        <div
          v-for="(album, index) in albums"
          :key="index"
          class="2xl:w-1/6 xl:w-1/5 lg:w-1/4 sm:w-1/3 px-3"
        >
          <span
            class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm"
            @click="lsCategory('album', album.name)"
          >
            <!-- <img class="rounded-md sm:m-2 lg:m-4 h-32 object-cover" :src="album.image" /> -->
            <div class="rounded-md sm:m-2 lg:m-4 h-32 overflow-hidden relative">
              <img
                class="hi w-full h-full object-cover relative top-full"
                :src="album.image"
                :ref="
                  el => {
                    if (el) albumsCovers[index] = el;
                  }
                "
              />
            </div>
            <span class="capitalize px-2 font-bold text-blue-100">
              <h3
                class="text-lg text-blue-50 whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden"
              >
                {{ album.name }}
              </h3>
              <div
                class="text-sm my-2 text-gray-400 overflow-hidden overflow-ellipsis h-11 font-roboto"
              >
                by {{ album.artist }}
              </div>
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- v-intersection:once="incrementArtistCounter" -->
    <!-- Artists -->
    <div class="text-left p-8">
      <h2
        class="text-3xl capitalize my-6 px-3"
        v-show="artists.length > 0"
        ref="artistSection"
      >
        Artists
      </h2>
      <div class="flex flex-wrap">
        <div
          v-for="(artist, index) in artists"
          :key="index"
          class="p-3"
          @click="lsCategory('artist', artist.name, artist.image)"
        >
          <span
            class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm w-40"
          >
            <div class="rounded-md sm:m-2 lg:m-4 overflow-hidden relative h-32">
              <img
                :class="`artist-cover-${index}`"
                class="w-full rounded-full h-full object-cover relative"
                style="clip-path : circle(100% at 50% 50%)"
                :src="artist.image"
              />
            </div>
            <span class="capitalize px-2 font-bold text-blue-100">
              <h3
                class="text-lg text-blue-50 whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden pb-8 text-center"
              >
                {{ artist.name }}
              </h3>
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- empty screen! -->
    <div
      v-show="albums.length === 0"
      class="bg-inherit w-full h-full absolute inset-0 flex flex-col justify-center items-center"
    >
      <div class="text-lg">No music found</div>
      <div class="text-base text-gray-400">
        To add a new library, navigate to settings > add library
      </div>
    </div>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, Ref, onMounted } from "vue";
import { Music } from "@/schema";
import { mapActions } from "vuex";
import { emptyAndFillArray } from "../helpers";
// @ts-ignore
import anime from "animejs/lib/anime.es.js";
import { useRouter } from "vue-router";
import { UNKNOWN_ARTIST } from "@/providers/constants";
import { useIntersectionObserver, whenever, and } from "@vueuse/core";
import { useIpcRenderer } from "@vueuse/electron";

const dripAnimation = (
  targetIndex: number,
  reverseDirection: boolean,
  onComplete?: Function
) => {
  anime({
    targets: `.artist-cover-${targetIndex}`,
    easing: "easeInOutSine",
    keyframes: reverseDirection
      ? [
          { clipPath: "circle(0% at 50% 50%)" },
          { clipPath: "circle(100% at 50% 50%)" }
        ]
      : [
          { clipPath: "circle(100% at 50% 50%)" },
          { clipPath: "circle(0% at 50% 50%)" }
        ],
    duration: 1000,
    complete: () => {
      onComplete && onComplete();
    }
  });
};

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRouter();
    const artistSection: Ref<HTMLElement | null> = ref(null);

    const recentlyAdded: Music[] = reactive([]),
      albums: { image: string; name: string; artist: string }[] = reactive([]),
      albumsCovers = ref([]),
      artists: { image: string; name: string }[] = reactive([]),
      artistCounter = ref(false);
    const ipcRenderer = useIpcRenderer();

    const targetIsVisible = ref(false);

    onMounted(() => {
      const { stop } = useIntersectionObserver(artistSection, (
        [{ isIntersecting }] /* observerElement */
      ) => {
        targetIsVisible.value = isIntersecting;
      });

      whenever(and(targetIsVisible, artistCounter), () => {
        stop();
        artists.forEach(async i => {
          if (i.name === UNKNOWN_ARTIST) return;

          ipcRenderer.send("api/artist.req", { q_original_name: i.name });
        });
      });

      ipcRenderer.send("albums/ls.req");
      ipcRenderer.send("artists/ls.req");
      ipcRenderer.send("recently_played.get.req");
    });

    ipcRenderer.on("api/artist.res", (_, data) => {
      artists.some((i, targetIndex) => {
        if (i.name === data.q_original_name) {
          dripAnimation(targetIndex, false, () => {
            i.image = data.picture_medium;
            dripAnimation(targetIndex, true);
          });

          return true;
        }
      });
    });

    ipcRenderer.on(
      "albums/ls.res",
      (_: any, payload: { image: string; name: string }[]) => {
        emptyAndFillArray(albums, payload);
      }
    );

    ipcRenderer.on(
      "artists/ls.res",
      (_: any, payload: { image: string; name: string }[]) => {
        emptyAndFillArray(artists, payload);
        artistCounter.value = true;
      }
    );

    ipcRenderer.on("recently_played.get.res", (_: any, payload: Music[]) => {
      emptyAndFillArray(recentlyAdded, payload.splice(0, 4));
    });

    watch(albums, () => {
      setTimeout(
        () => {
          anime({
            targets: albumsCovers.value,
            translateY: "-100%",
            duration: 900,
            opacity: [0, 1],
            easing: "easeOutQuint",
            delay: function(el: any, i: number) {
              return i * 120;
            }
          });
        },
        history.state.back === null && history.state.forward === null
          ? 1200
          : 100
      );
    });

    return {
      ...mapActions(["playMusic"]),
      artistSection,
      lsCategory: (
        categoryType: string,
        categoryName: string,
        categoryImage: string = ""
      ) => {
        console.log(categoryImage);
        router.push({
          name: "category",
          params: { categoryType, categoryName, categoryImage }
        });
      },
      albumsCovers,
      albums,
      artists,
      recentlyAdded,
      targetIsVisible
      // incrementArtistCounter
    };
  }
});
</script>

<style lang="scss">
.bg-inherit {
  background: inherit;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  cursor: pointer;
  visibility: 1;
  opacity: 0;
}

input[type="range"]::-webkit-slider-thumb:hover {
  opacity: 1;
}

._3-line-3-dots {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
