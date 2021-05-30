<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <div
      class="text-left p-8 transition-all delay-200"
      :style="{
        background: `linear-gradient(180deg, rgba(${bgColors[0]},${bgColors[1]},${bgColors[2]},1) -35%, rgba(0,212,255,0) 100%)`
      }"
    >
      <!-- bg-gradient-to-b from-green-500  -->
      <button @click="sim++">SOMOM {{ sim }}</button>
      <!-- card -->
      <h2 class="text-3xl capitalize">good evening</h2>
      <div class="my-6 flex flex-wrap">
        <div
          v-for="(music, index) in recentlyAdded"
          :key="music.id"
          @click="playMusic(music)"
          class="sm:w-6/12 lg:w-1/3 xl:w-1/4"
          @mouseover="mouseOver(index)"
          @mouseleave="mouseLeave"
        >
          <div class="p-1">
            <span
              class="bg-gray-600 bg-opacity-40 flex items-center rounded-md"
            >
              <img
                class="rounded-l-md w-28 h-28 object-cover"
                :src="music.img"
                :ref="
                  el => {
                    if (el) imgElements[index] = el;
                  }
                "
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
    <div id="recenty played" class="text-left p-8">
      <h2 class="text-3xl capitalize my-6">Albums</h2>
      <div class="flex overflow-x-hidden">
        <div
          v-for="(album, index) in album"
          :key="index"
          class="2xl:w-1/6 xl:w-1/5 lg:w-1/4 sm:w-1/3 px-3"
        >
          <span
            class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm"
            @click="lsCategory"
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
                by mark francis carandang sdfage ergwergerg erwgwrg
              </div>
            </span>
          </span>
        </div>
      </div>
    </div>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
  <transition name="v">
    <player v-show="showPlayerBox" />
  </transition>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  computed,
  reactive,
  watch
} from "vue";
import { ipcRenderer } from "electron";
import Player from "../components/PlayerBox.vue";
import { Message, Music, Notification } from "@/schema";
import { cloneDeep } from "lodash";
import { useStore } from "vuex";
import { getAverageRGB, fullRoute } from "@/components/frontEndUtils.ts";
import { emptyAndFillArray } from "../helpers";

// @ts-ignore
import anime from "animejs/lib/anime.es.js";
import { useRouter } from "vue-router";

type RGB = [number, number, number];

export default defineComponent({
  name: "Home",
  components: { Player },
  setup() {
    const recentlyAdded: Music[] = reactive([]),
      album = reactive([]);
    const router = useRouter();
    const store = useStore();
    const questAlert = (params: Notification) => {
      store.dispatch("alert", params);
    };
    const imgElements = ref([]);
    const albumsCovers = ref([]);

    const bgColors: number[] = reactive([34, 197, 94]);
    let hover = false;
    let back2default: number;

    const mouseOver = (index: number) => {
      if (hover) return;

      hover = true;

      const { r, g, b } = getAverageRGB(imgElements.value[index]);
      chnageBackgound([r, g, b]);

      clearTimeout(back2default);
      back2default = window.setTimeout(() => {
        chnageBackgound([0, 0, 0]);
      }, 5000);
    };

    const mouseLeave = () => {
      hover = false;
    };

    const chnageBackgound = (to: RGB) => {
      const rgb: { r: number; g: number; b: number } = {
        r: bgColors[0],
        g: bgColors[1],
        b: bgColors[2]
      };

      anime({
        targets: rgb,
        r: to[0],
        g: to[1],
        b: to[2],
        round: 1,
        easing: "linear",
        update: function() {
          bgColors[0] = rgb.r;
          bgColors[1] = rgb.g;
          bgColors[2] = rgb.b;
        }
      });
    };

    onMounted(() => {
      ipcRenderer.send(fullRoute.req("home"));
      ipcRenderer.send(fullRoute.req("recently_played.get"));
      ipcRenderer.send(fullRoute.req("albums"));

      ipcRenderer.on(fullRoute.res("home"), (_, params: Array<Music>) => {
        console.log(cloneDeep(params));
        emptyAndFillArray(recentlyAdded, params.splice(0, 4));
      });

      ipcRenderer.on(
        fullRoute.res("recently_played.get"),
        (_, params: Music[]) => {
          console.log("heeey", params);
        }
      );

      ipcRenderer.on(
        fullRoute.res("albums"),
        (_, payload: { image: string; name: string }[]) => {
          emptyAndFillArray(album, payload);
        }
      );

      ipcRenderer.on("DB-Changed", () => {
        questAlert({ title: "re scanning library", type: "refresh" });

        ipcRenderer.send(fullRoute.req("albums"));
        ipcRenderer.send("route.home.req");
      });
    });

    watch(album, () => {
      setTimeout(() => {
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
      }, 1200);
    });
    return {
      // refreshIndex,
      sim: ref(0),
      lsCategory: () => {
        router.push("/category/album/Randomac cessMemory");
      },
      albumsCovers,
      album,
      recentlyAdded,
      mouseOver,
      mouseLeave,
      imgElements,
      bgColors,
      playMusic: (song: Music) => {
        store.dispatch("playMusic", song);
      },
      showPlayerBox: computed(() => store.state.player.status !== "empty")
    };
  }
});
</script>

<style lang="scss">
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

.v {
  &-enter-from,
  &-leave-to {
    transition: all 0.8s ease;
    opacity: 0;
    transform: translateY(100%);
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
