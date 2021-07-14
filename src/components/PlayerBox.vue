<template>
  <!-- <canvas class="fixed top-10 left-10 w-96 h-96"></canvas> -->
  <div class="absolute bg-black w-screen bottom-0 h-24 flex flex-row">
    <div id="cover-and-title" class="flex w-1/3">
      <div id="cover" class="w-24 h-24 p-2">
        <img
          v-show="currentMusic.img"
          :src="currentMusic.img"
          class="object-cover h-full w-full"
        />
      </div>
      <div id="title" class="w-8/12 text-gray-200 flex flex-col justify-center">
        <h2
          class="font-bold overflow-ellipsis whitespace-nowrap overflow-x-hidden"
        >
          {{ currentMusic.title }}
        </h2>
        <div
          class="text-gray-300 overflow-ellipsis whitespace-nowrap overflow-x-hidden capitalize"
        >
          {{ currentMusic.album }}
        </div>
      </div>
    </div>
    <div id="controlers" class="w-1/3 flex flex-col h-full">
      <div class="h-3/5 flex justify-center items-center relative">
        <div
          @click="emptyMusic"
          class="rounded-ful text-gray-300 hover:text-gray-100 h-8 w-8 cursor-pointer flex mx-2 absolute left-0"
        >
          <div>
            <svg class="m-1 w-full fill-current" viewBox="0 0 32 32">
              <path :d="icons.close" />
            </svg>
          </div>
        </div>

        <div
          class="rounded-full h-8 w-8 text-gray-300 hover:text-gray-100 cursor-pointer flex mx-2"
        >
          <svg class="p-2 w-full fill-current" viewBox="0 0 32 32">
            <g>
              <path
                d="M30.5,2.62a1,1,0,0,0-1,0L7.82,15.13a1,1,0,0,0,0,1.74L29.5,29.38a1,1,0,0,0,1.5-.86v-25A1,1,0,0,0,30.5,2.62ZM29,26.78,10.32,16,29,5.22Z"
              />
              <path
                d="M2,5.2a1,1,0,0,0-1,1V25.8a1,1,0,0,0,2,0V6.2A1,1,0,0,0,2,5.2Z"
              />
            </g>
          </svg>
        </div>
        <div
          v-if="musicStatus === `paused` || musicStatus === 'finished'"
          @click="resumeMusic"
          class="rounded-full h-10 w-10 text-gray-100 cursor-pointer flex mx-2"
        >
          <svg class="p-2 w-full fill-current" viewBox="0 0 32 32">
            <path
              d="M28.62,15.13,4.38,1.13A1,1,0,0,0,2.88,2V30a1,1,0,0,0,.5.87,1,1,0,0,0,1,0l24.24-14A1,1,0,0,0,28.62,15.13ZM4.88,28.27V3.73L26.12,16Z"
            />
          </svg>
        </div>

        <div
          v-else
          @click="pauseMusic"
          class="rounded-full h-10 w-10 text-gray-100 cursor-pointer flex mx-2"
        >
          <svg class="p-2 w-full fill-current" viewBox="0 0 32 32">
            <g>
              <path
                d="M7.6,1a1,1,0,0,0-1,1V30a1,1,0,0,0,2,0V2A1,1,0,0,0,7.6,1Z"
              />
              <path
                d="M24.4,1a1,1,0,0,0-1,1V30a1,1,0,0,0,2,0V2A1,1,0,0,0,24.4,1Z"
              />
            </g>
          </svg>
        </div>

        <div
          ref="playNextBtn"
          class="bg-red-500 rounded-full h-8 w-8 text-gray-300 hover:text-gray-100 cursor-pointer flex mx-2 relative"
        >
          <div
            v-if="showPlayNextPreview && playNextPreview !== undefined"
            class="w-32 h-10 bg-gray-400 absolute transform -translate-y-full bottom-1"
          >
            {{ playNextPreview.title }}
          </div>

          <svg
            class="p-2 pointer-events-none w-full fill-current"
            viewBox="0 0 32 32"
          >
            <g>
              <path
                d="M24.18,15.13,2.5,2.62A1,1,0,0,0,1,3.48v25a1,1,0,0,0,1.5.86L24.18,16.87A1,1,0,0,0,24.18,15.13ZM3,26.78V5.22L21.68,16Z"
              />
              <path
                d="M30,5.2a1,1,0,0,0-1,1V25.8a1,1,0,0,0,2,0V6.2A1,1,0,0,0,30,5.2Z"
              />
            </g>
          </svg>
        </div>

        <button
          :disabled="heartIconHalt"
          class="rounded-full h-8 w-8 cursor-pointer flex mx-2 absolute right-0"
        >
          <div
            :class="{ pulse: currentMusic.favorite }"
            ref="heartIconRef"
            @click="makeFavorite"
          ></div>
        </button>
      </div>
      <div class="h-2/5 w-full flex justify-between items-center">
        <span class="text-sm text-gray-200 w-12 text-left">{{
          currentTime
        }}</span>
        <div class="mx-2 relative w-full">
          <div class="h-1 bg-white w-full absolute top-0"></div>
          <div
            class="h-1 bg-gradient-to-r absolute from-green-400 to-blue-500"
            :style="{ width: seek + '%' }"
          ></div>
          <!-- :class="['from-green-400 to-blue-500','from-purple-400 via-pink-500 to-red-500'][rand(2)]" -->
          <input
            v-model="seek"
            type="range"
            class="w-full absolute top-0 h-1 ring-cyan-300"
          />
        </div>
        <span class="text-sm text-gray-200 w-12 text-right">{{
          duration
        }}</span>
      </div>
    </div>
    <div
      id="volume"
      class="w-1/3 flex justify-end items-center text-gray-100 p-3"
    >
      <div class="w-4 mx-1">
        <svg viewBox="0 0 32 32" class="fill-current">
          <g>
            <path
              d="M1.5,11.66a1,1,0,0,0,1,0l7.75-4.4a1,1,0,0,0,0-1.74L2.49,1.13A1,1,0,0,0,1,2v8.8A1,1,0,0,0,1.5,11.66ZM3,3.72,7.72,6.4,3,9.08Z"
            />
            <path d="M14,7.4H30a1,1,0,0,0,0-2H14A1,1,0,0,0,14,7.4Z" />
            <path d="M30,13.27H2a1,1,0,0,0,0,2H30A1,1,0,0,0,30,13.27Z" />
            <path d="M30,21.13H2a1,1,0,0,0,0,2H30A1,1,0,0,0,30,21.13Z" />
            <path d="M30,29H2a1,1,0,0,0,0,2H30A1,1,0,0,0,30,29Z" />
          </g>
        </svg>
      </div>
      <div class="w-4 mx-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-volume-2"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path
            d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
          />
        </svg>
      </div>
      <div class="w-24">
        <input
          class="w-full max-h-1 hover:max-h-2"
          max="100"
          min="0"
          v-model="volume"
          type="range"
        />
      </div>

      <!-- <pre
        class="w-300 absolute bottom-16 right-right-14 pointer-events-none"
        style="text-align: end;"
      >
  {{$store.state.music}}
      </pre>-->

      <div class="w-4 mx-1">
        <svg viewBox="0 0 24 24" class="fill-current">
          <path
            d="M9.79,12.79,4,18.59V17a1,1,0,0,0-2,0v4a1,1,0,0,0,.08.38,1,1,0,0,0,.54.54A1,1,0,0,0,3,22H7a1,1,0,0,0,0-2H5.41l5.8-5.79a1,1,0,0,0-1.42-1.42ZM21.92,2.62a1,1,0,0,0-.54-.54A1,1,0,0,0,21,2H17a1,1,0,0,0,0,2h1.59l-5.8,5.79a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L20,5.41V7a1,1,0,0,0,2,0V3A1,1,0,0,0,21.92,2.62Z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref, Ref, watch } from "vue";
import { useStore, mapActions } from "vuex";

import lottie, { AnimationItem } from "lottie-web";
import { mdiClose } from "@mdi/js";
import { ipcRenderer } from "electron";
import { useEventListener } from "@vueuse/core";
const { lifeCycleMixin } = require("@/components/mixins");

const secToMin = (sec: number): string =>
  String(Math.floor(sec / 60)) +
  ":" +
  String((Math.floor(sec % 60) / 10).toFixed(1)).replace(".", "");

export default defineComponent({
  name: "Player",
  components: {},
  mixins: [lifeCycleMixin],
  setup() {
    const store = useStore();
    let heartIcon: AnimationItem;
    const heartIconRef: Ref<any> = ref(null);
    const heartIconHalt = ref(false);
    const showPlayNextPreview = ref(false);

    const playNextBtn = ref<HTMLDivElement>();
    useEventListener(playNextBtn, "mouseover", e => {
      // e.stopImmediatePropagation();
      // e.preventDefault();
      // e.stopPropagation();
      // console.log(e);
      showPlayNextPreview.value = true;
    });

    useEventListener(playNextBtn, "mouseleave", e => {
      // e.stopImmediatePropagation();
      // e.preventDefault();
      // e.stopPropagation();
      // console.log(e);
      showPlayNextPreview.value = false;
    });

    const makeFavorite = async () => {
      heartIcon.play();
      heartIconHalt.value = true;
      const res: boolean = await ipcRenderer.invoke("favorite/set", {
        payload: {
          id: store.state.music.id,
          fullpath: store.state.music.fullpath,
          value: !store.state.music.favorite
        }
      });

      if (res) store.dispatch("toggleHeart");
      else heartIconHalt.value = false;
    };

    function liked() {
      heartIcon.goToAndPlay(150);
      heartIcon.addEventListener("complete", () => {
        heartIconHalt.value = false;
      });
    }

    function disliked() {
      heartIcon.stop();
      heartIconHalt.value = false;
    }

    watch(
      () => store.state.music.favorite,
      newVal => {
        console.log("favorite", newVal);
        if (newVal) {
          liked();
        } else {
          disliked();
        }
      }
    );

    onMounted(() => {
      heartIcon = lottie.loadAnimation({
        container: heartIconRef.value as Element,
        renderer: "svg",
        loop: false,
        autoplay: store.state.music.favorite,
        path: "favorite.json"
      });
    });

    return {
      playNextBtn,
      showPlayNextPreview,
      playNextPreview: computed(() => {
        return store.state.player.playList[
          store.state.player.playListIndex + 1
        ];
      }),
      makeFavorite,
      heartIconRef,
      heartIconHalt,
      musicStatus: computed(() => store.getters.musicStatus),
      ...mapActions(["resumeMusic", "pauseMusic", "emptyMusic", "stopMusic"]),

      seek: computed({
        get() {
          return store.getters.progress;
        },
        set(v: string) {
          store.commit("seek", Number(v));
        }
      }),
      duration: computed(() => secToMin(store.state.player.duration)),
      volume: computed({
        get(): string {
          return store.state.player.volume;
        },
        set(v: string) {
          store.commit("changeVolume", Number(v));
        }
      }),
      currentTime: computed(() => secToMin(store.state.player.currentTime)),
      progress: computed(() => store.state.player.progress),
      currentMusic: computed(() => store.state.music),
      icons: {
        close: mdiClose
      },
      rand: (range: number) => Math.floor(Math.random() * range)
    };
  }
});
</script>

<style lang="scss">
.pulse {
  animation-name: tap;
  animation-duration: 2s;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
  animation-delay: 0s;
}

@keyframes tap {
  0% {
    transform: scale(0);
  }
  20% {
    transform: scale(1.7);
  }
  90% {
    transform: scale(1.7);
  }
  100% {
    transform: scale(1);
  }
}

input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  background: #0000;
  border-radius: 25px;
  border: 0px solid #000101;
}
input[type="range"]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 0px solid #000000;
  margin-top: -2px;
  cursor: pointer;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
  /* -webkit-appearance: none; */
}
/* input[type="range"]:focus::-webkit-slider-runnable-track {
  background: #6751b5;
} */
</style>
