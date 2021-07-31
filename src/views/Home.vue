<template>
  <main
    class="bg-gray-800 text-center text-white w-full overflow-y-scroll relative"
  >
    <div class="relative h-72 w-full">
      <img
        class="w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1524230659092-07f99a75c013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxfDB8MXxhbGx8fHx8fHx8fA&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit"
      />
      <div
        class="absolute flex pl-10 items-center inset-0 w-full h-full bg-gray-900 bg-opacity-30"
      >
        <h1 class="text-4xl capitalize">
          good
          {{ time }}
        </h1>
      </div>
    </div>

    <div ref="gradient_pl" class="text-left p-8 transition-all delay-200">
      <!-- bg-gradient-to-b from-green-500  -->
      <!-- <div class="w-20 h-20 bg-white fixed top-10 left-10 text-red-500">
        <div class="sm:block md:hidden">sm</div>
        <div class="md:block lg:hidden">md</div>
        <div class="lg:block xl:hidden">lg</div>
        <div class="xl:block 2xl:hidden">xl</div>
      </div>-->
      <!-- card -->
      <h2 class="text-3xl capitalize">recently added</h2>
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
      <h2 class="text-3xl capitalize my-6 px-3">Albums</h2>
      <grid-style-items
        :items="albums"
        name="albums"
        initial-style="transform: translateY(-100%); opacity: 1;"
        @clicked="lsCategory('album', $event[0].name, $event[0].image)"
        @on-batch-action="log($event)"
        :batch-action="true"
      />
    </div>

    <!-- Artists -->
    <div class="text-left p-8" v-if="artists.length > 0">
      <h2 class="text-3xl capitalize my-6 px-3" ref="artistSection">Artists</h2>
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
            <div class="rounded-md sm:m-4 lg:m-4 overflow-hidden relative h-32">
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
import { defineComponent, ref, watch, Ref, onMounted, reactive } from "vue";
import { Music, ImageManagerBufferType } from "@/schema";
import { mapActions, useStore } from "vuex";
// @ts-ignore
import anime from "animejs/lib/anime.es.js";
import { useRouter } from "vue-router";
import { UNKNOWN_ARTIST } from "@/providers/constants";
import { useIntersectionObserver, whenever, and } from "@vueuse/core";
import { remove, cloneDeep } from "lodash";
import GridStyleItems from "@/components/GridStyleItems.vue";
import { ipcRenderer } from "electron";
import { fillArray } from "@/helpers";

const t = new Date().getHours();

const time =
  4 <= t && t <= 10
    ? "morning"
    : 11 <= t && t <= 16
    ? "after noon"
    : 17 <= t && t < 21
    ? "evening"
    : "night";

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
    delay: 100 * targetIndex,
    complete: () => {
      onComplete && onComplete();
    }
  });
};

interface CategoryIterators {
  image: string;
  name: string;
  description?: string;
}

export default defineComponent({
  name: "Home",
  components: { GridStyleItems },
  setup() {
    const router = useRouter();
    const store = useStore();
    const artistSection: Ref<HTMLElement | null> = ref(null);
    const recentlyAdded: Music[] = reactive([]);
    const artists: CategoryIterators[] = reactive([]);
    const albums: CategoryIterators[] = reactive([]);

    const artistCounter = ref(false);
    const targetIsVisible = ref(false);

    onMounted(() => {
      ipcRenderer.invoke("artists/ls").then((data: CategoryIterators[]) => {
        fillArray(artists, data);
        artistCounter.value = true;
      });
      ipcRenderer.invoke("albums/ls").then((data: CategoryIterators[]) => {
        fillArray(albums, data);
      });
      ipcRenderer.invoke("recently_played.get").then((data: Music[]) => {
        console.log(data);
        fillArray(recentlyAdded, data);
      });

      const { stop } = useIntersectionObserver(artistSection, (
        [{ isIntersecting }] /* observerElement */
      ) => {
        targetIsVisible.value = isIntersecting;
      });

      whenever(and(targetIsVisible, artistCounter), async () => {
        stop();
        const payload = artists
          .filter(i => i.name !== UNKNOWN_ARTIST)
          .map(i => i.name);

        const data: ImageManagerBufferType[] = await ipcRenderer.invoke(
          "api/artist",
          payload
        );

        const r = cloneDeep(data);

        artists.forEach((j, imageIndex) => {
          remove(r, i => {
            if (i.name === j.name) {
              dripAnimation(imageIndex, false, () => {
                j.image = i.address;
                dripAnimation(imageIndex, true);
              });
              return true;
            }
          });
        });
      });
    });

    watch(albums, () => {
      setTimeout(
        () => {
          anime({
            targets: ".albums-cover",
            translateY: "0%",
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

    const lsCategory = (
      categoryType: string,
      categoryName: string,
      categoryImage: string = ""
    ) => {
      router.push({
        name: "category",
        params: { categoryType, categoryName, categoryImage }
      });
    };

    const log = async (a: any) => {
      try {
        const musicsIds: string[] = await ipcRenderer.invoke("albums/all", {
          payload: { albumName: a[0]["name"] }
        });

        await store.dispatch("addToQueue", musicsIds);

        const firstSong: Music = await ipcRenderer.invoke("getMusicById", {
          musicId: musicsIds[0]
        });
        store.dispatch("playMusic", firstSong);
      } catch (error) {
        alert(error);
      }
    };

    return {
      ...mapActions(["playMusic"]),
      log,
      artistSection,
      lsCategory,
      albums,
      artists,
      recentlyAdded,
      time
    };
  }
});
</script>

<style lang="scss">
.bg-inherit {
  background: inherit;
}

._3-line-3-dots {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
