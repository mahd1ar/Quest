<template>
  <div class="ctrl w-full h-full py-5">
    <!-- :class="{ [!!music ? 'max-w-xs' : 'max-w-0']: true }" -->
    <transition name="player">
      <div class="flex flex-col" v-if="music">
        <div class="mx-auto h-48 w-80">
          <img
            class="inline-block w-full h-full object-contain"
            :src="music.img"
          />
        </div>
        <br />
        <div class="px-4 w-80">
          <!-- title -->
          <div class="my-4 w-full overflow-x-hidden">
            <h1
              class="text-white text-2xl text-center whitespace-nowrap w-full"
              style="--count: 0"
            >
              {{ music.title }}
            </h1>
            <h2 class="text-center" style="--count: 1">
              {{ music.artist }}
            </h2>
          </div>

          <div class="">
            <div class="flex justify-between py-3">
              <button
                @click="toggleFavorite"
                class="text-white w-6 text-center"
                style="--count: 2"
              >
                <svg
                  v-if="music.favorite"
                  class="text-red-600 w-full fill-current h-full"
                  viewBox="0 0 24 24"
                >
                  <path :d="icons.heart.full" />
                </svg>
                <svg
                  v-else
                  class="w-full fill-current h-full"
                  viewBox="0 0 24 24"
                >
                  <path :d="icons.heart.empty" />
                </svg>
              </button>

              <button
                ref="volumeRef"
                class="text-white text-center"
                style="--count: 2"
              >
                <input v-model="volume" v-show="volumeHovered" type="range" />
                <svg
                  v-show="!volumeHovered"
                  class="w-6 fill-current h-full"
                  viewBox="0 0 24 24"
                >
                  <path :d="icons.volume.high" />
                </svg>
              </button>
            </div>

            <progress-component v-model:percentage="percentage" />

            <div class="flex justify-center py-3">
              <button
                @click="closePlayer"
                class="text-white w-6 text-center mr-auto"
                style="--count: 2"
              >
                <svg class="w-full fill-current h-full" viewBox="0 0 24 24">
                  <path :d="icons.close" />
                </svg>
              </button>

              <button class="text-white w-8 text-center" style="--count: 3">
                <svg class="w-full fill-current h-full" viewBox="0 0 24 24">
                  <path :d="icons.rewind" />
                </svg>
              </button>

              <button
                class="text-white w-11 text-center"
                @click="togglePlay"
                style="--count: 4"
              >
                <svg class="w-full fill-current h-full" viewBox="0 0 24 24">
                  <!-- "playing" | "paused" | "empty" | "stopped" | "finished" -->
                  <path v-if="status === 'playing'" :d="icons.pause" />
                  <path v-else :d="icons.play" />
                </svg>
              </button>

              <button class="text-white w-8 text-center" style="--count: 5">
                <svg class="w-full fill-current h-full" viewBox="0 0 24 24">
                  <path :d="icons.fastForward" />
                </svg>
              </button>

              <button
                class="text-white w-6 text-center ml-auto outline-none"
                @click="changeRepeatStatus"
                style="--count: 6"
              >
                <svg class="w-full fill-current h-full" viewBox="0 0 24 24">
                  <path :d="icons.repeat[repeatStatus]" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <teleport v-if="music" to="#popup-target">
      <div class="flex items-center gap-2">
        <div data-visualizer>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p class="text-xs">Playing</p>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref, onMounted, watch } from "vue";

import Progress from "@/components/Progress.vue";
import { useStore } from "vuex";
import { VuexState } from "@/schema";
import {
  mdiPlay,
  mdiStop,
  mdiPause,
  mdiFastForward,
  mdiRewind,
  mdiRepeat,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiClose,
  mdiVolumeOff,
  mdiVolumeMedium,
  mdiVolumeLow,
  mdiVolumeHigh,
  mdiHeartOutline,
  mdiHeart
} from "@mdi/js";
import { useElementHover } from "@vueuse/core";
import { useGlobalState } from "@/store/GlobalState";
import { timeout } from "@/helpers";

// const secToMin = (sec: number): string =>
//   String(Math.floor(sec / 60)) +
//   ":" +
//   String((Math.floor(sec % 60) / 10).toFixed(1)).replace(".", "");

async function barsVisualizer(cycle = 0) {
  const bars = document.querySelectorAll("div[data-visualizer] div");
  const lenght = bars.length;

  if (length === 0) return;

  bars.forEach((bar, index) => {
    const valuse = [0, 50, 100, 50, 0];

    // @ts-ignore
    bar.style.height = valuse[(index + cycle) % lenght] * 0.2 + "px"; //+ "%";
  });

  await timeout(300);

  barsVisualizer(cycle + 1);
}

export default defineComponent({
  name: "Controller",
  components: { "progress-component": Progress },
  setup() {
    const store = useStore<VuexState>();
    const globalState = useGlobalState();
    const repeatStatus: Ref<"repeat" | "off" | "once"> = ref("repeat");
    const volumeRef = ref();
    const volumeHovered = useElementHover(volumeRef);

    onMounted(async () => {});

    const music = computed(() => {
      return store.state.player.currentMusicIndex === -1
        ? false
        : store.state.library.list[
            store.state.player.playList[store.state.player.currentMusicIndex]
          ];
    });

    watch(music, async newVal => {
      if (newVal) {
        await timeout(2000);
        barsVisualizer();
      }
    });

    const percentage = computed({
      get() {
        return store.state.player.progress;
      },
      set(v: number) {
        store.dispatch("player/seek", v);
      }
    });

    const icons = {
      play: mdiPlay,
      stop: mdiStop,
      fastForward: mdiFastForward,
      rewind: mdiRewind,
      pause: mdiPause,
      close: mdiClose,
      volume: {
        high: mdiVolumeHigh,
        low: mdiVolumeLow,
        medium: mdiVolumeMedium,
        off: mdiVolumeOff
      },
      repeat: {
        repeat: mdiRepeat,
        off: mdiRepeatOff,
        once: mdiRepeatOnce
      },
      heart: {
        empty: mdiHeartOutline,
        full: mdiHeart
      }
    };

    const volume = computed({
      get(): number {
        return store.state.player.volume;
      },
      set(v: number) {
        store.dispatch("player/changeVolume", Number(v));
      }
    });

    const toggleFavorite = () => {
      console.log(music.value);
      if (music.value) store.dispatch("library/toggleFavorite", music.value.id);
    };
    const changeRepeatStatus = () => {
      switch (repeatStatus.value) {
        case "repeat":
          repeatStatus.value = "off";
          break;
        case "off":
          repeatStatus.value = "once";
          break;

        default:
          repeatStatus.value = "repeat";
          break;
      }
    };

    const closePlayer = () => {
      store.dispatch("player/emptyMusic");
    };

    const status = computed(() => store.state.player.status);

    const togglePlay = () => {
      if (status.value === "playing") store.dispatch("player/pauseMusic");
      else if (status.value === "paused") store.dispatch("player/resumeMusic");
      // else if(status.value ==="finished")
    };

    return {
      togglePlay,
      percentage,
      music,
      icons,
      status,
      changeRepeatStatus,
      repeatStatus,
      closePlayer,
      volumeRef,
      volumeHovered,
      volume,
      toggleFavorite,
      globalState
    };
  }
});
</script>

<style lang="scss" scoped>
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

.player {
  // &-enter-from {
  //   transition: all 1.5s ease;
  //   transform: translateY(10%);
  //   button,
  //   div {
  //     opacity: 1;
  //   }
  // }

  &-leave-to,
  &-enter-from {
    transition: all 0.5s ease;
    transform: translateY(-10%);
    button,
    div {
      opacity: 0;
      transition: all 0.4s ease;
      transition-delay: calc(var(--count) * 100ms);
    }
  }

  &-leave-from,
  &-enter-to {
    transition: all 1.5s ease;
    transform: translateY(0px);
    button,
    div {
      opacity: 1;
      transition: all 0.4s ease;
      transition-delay: calc(var(--count) * 100ms);
    }
  }
}

div[data-visualizer] {
  display: flex;
  height: 100%;
  align-items: center;
  border: 1px solid #ffffff7d;
  border-radius: 2px;
  justify-content: center;
  height: 19px;
  width: 32px;
  div {
    @apply bg-white bg-opacity-50;
    width: 2px;

    margin: 0 1px;
    transition: all 1s ease;
  }
}
</style>
