<template>
  <!-- <canvas class="fixed top-10 left-10 w-96 h-96"></canvas> -->
  <div class="ctrl absolute w-screen bottom-0 h-24 flex flex-row">
    <div class="flex-1 flex flex-col">
      <button class="text-white" @click="togglePlay">playing</button>
      <progress-component v-model:percentage="percentage" />
    </div>
    <div class="flex-1">{{ music }}</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onMounted,
  ref,
  Ref,
  watch,
  reactive
} from "vue";

import Progress from "@/components/Progress.vue";
import { useStore } from "vuex";
import { VuexState } from "@/schema";

// const secToMin = (sec: number): string =>
//   String(Math.floor(sec / 60)) +
//   ":" +
//   String((Math.floor(sec % 60) / 10).toFixed(1)).replace(".", "");

export default defineComponent({
  name: "Controller",
  components: { "progress-component": Progress },
  setup() {
    const store = useStore<VuexState>();
    // const router = useRouter();
    const music = computed(() => {
      return store.state.player.currentMusicIndex === -1
        ? false
        : store.state.library.list[store.state.player.currentMusicIndex];
    });

    const percentage = computed({
      get() {
        return store.state.player.progress;
      },
      set(v: number) {
        store.dispatch("player/seek", v);
      }
    });

    const togglePlay = () => {
      if (store.state.player.status === "playing")
        store.dispatch("player/pauseMusic");
      else if (store.state.player.status === "paused")
        store.dispatch("player/resumeMusic");
    };

    return { togglePlay, percentage, music };
  }
});
</script>

<style lang="scss">
.ctrl {
  background: #00000010;
  backdrop-filter: blur(20px);
}

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
