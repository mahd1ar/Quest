<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <div
      class="text-left p-8 transition-all delay-200"
      :style="{
        background: `linear-gradient(180deg, rgba(${bgColors[0]},${bgColors[1]},${bgColors[2]},1) -35%, rgba(0,212,255,0) 100%)`
      }"
    >
      <!-- bg-gradient-to-b from-green-500  -->

      <!-- card -->
      <h2 class="text-3xl capitalize">good evening</h2>
      <div class="my-6 flex flex-wrap">
        <div
          v-for="(music, index) in data.recentlyAdded"
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
          v-for="(album, index) in data.album"
          :key="index"
          class="2xl:w-1/6 xl:w-1/5 lg:w-1/4 sm:w-1/3 px-3"
        >
          <span
            class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm"
          >
            <img
              class="rounded-md sm:m-2 lg:m-4 h-32 object-cover"
              :src="album.image"
            />
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
import { defineComponent, onMounted, ref, computed, reactive } from "vue";
import { ipcRenderer } from "electron";
import Player from "../components/PlayerBox.vue";
import { Message, Music, Notification } from "@/schema";
import { cloneDeep } from "lodash";
import { useStore } from "vuex";
import { getAverageRGB } from "@/components/frontEndUtils.ts";
import { emptyAndFillArray } from "../helpers";
import { fill } from "lodash";
// const anime = require("animejs");

interface HomeData {
  album: Music[];
  artist: Music[];
  recentlyAdded: Music[];
}

export default defineComponent({
  name: "Home",
  components: { Player },
  setup() {
    // const refreshIndex = ref(0);
    const data: HomeData = reactive({
      recentlyAdded: [],
      album: [],
      artist: []
    }); //as HomeData;
    const store = useStore();
    const questAlert = (params: Notification) => {
      store.dispatch("alert", params);
    };
    const imgElements = ref([]);
    const bgColors: number[] = reactive([34, 197, 94]);
    let hover = false;
    let back2default: number;

    const mouseOver = (index: number) => {
      if (hover) return;

      hover = true;

      const { r, g, b } = getAverageRGB(imgElements.value[index]);
      bgColors[0] = r;
      bgColors[1] = g;
      bgColors[2] = b;

      clearTimeout(back2default);

      back2default = window.setTimeout(() => {
        fill(bgColors, 0);
      }, 5000);
    };

    const mouseLeave = () => {
      hover = false;
    };

    onMounted(() => {
      ipcRenderer.send("route.home.req");

      ipcRenderer.on("route.home.res", (_, params: HomeData) => {
        console.log(cloneDeep(params));
        emptyAndFillArray(
          data.recentlyAdded,
          params.recentlyAdded.splice(0, 4)
        );
        // data.recentlyAdded = params.recentlyAdded;
        emptyAndFillArray(data.album, params.album.splice(0, 6));
        // refreshIndex.value++;
      });

      ipcRenderer.on("DB-Changed", (_, params: Message) => {
        // refreshIndex.value++;

        questAlert({ title: "something is changed" });

        ipcRenderer.send("route.home.req");
      });

      // setTimeout(() => {
      // anime({
      //   targets: imgElements,
      //   translateX: 250,
      //   rotate: "1turn",
      //   backgroundColor: "#FFF",
      //   duration: 800
      // });
      // }, 2000);
    });

    return {
      // refreshIndex,
      data,
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
