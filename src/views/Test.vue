<template>
  <main class="bg-gray-800 text-center w-full overflow-y-scroll">
    <h1 class="text-yellow-200">{{ musicFullpath }}</h1>
    <div
      id="canvas_container"
      class="relative"
      :style="{ width: canvas_width + 'px', height: canvas_height + 'px' }"
    >
      <canvas
        class="inline absolute left-0"
        id="canvas_pri"
        :width="canvas_width"
        :height="canvas_height"
      ></canvas>
      <div
        id="progress-width"
        class="inline absolute left-0 overflow-hidden"
        :style="{ width: progress + '%' }"
      >
        <canvas
          id="canvas_sec"
          :width="canvas_width"
          :height="canvas_height"
        ></canvas>
      </div>
    </div>
    <pre>

    {{ JSON.stringify(globalState) }}
    </pre>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, computed } from "vue";
import { useStore } from "vuex";
import { VuexState } from "@/schema";
let animationFrame: number;

import { useGlobalState } from "@/store/GlobalState";
export default defineComponent({
  name: "Home",
  setup() {
    const store = useStore<VuexState>();
    const musicFullpath =
      store.state.library.list[store.state.player.currentMusicIndex].fullpath;

    const canvas_width = ref(500);
    const canvas_height = ref(330);

    const progress = computed(() => store.state.player.progress);

    onMounted(() => {
      const filterData = (audioBuffer: AudioBuffer) => {
        const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
        const samples = 70; // Number of samples we want to have in our final data set
        const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i; // the location of the first sample in the block
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
          }
          filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
        }
        return filteredData;
      };

      const normalizeData = (filteredData: number[]) => {
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        return filteredData.map(n => n * multiplier);
      };

      const audioContext = new AudioContext();

      fetch(musicFullpath)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          const hash = normalizeData(filterData(audioBuffer));
          console.log(hash);
          const bar_width = 3;
          const bar_gap = bar_width / 2;
          // const max_bar_height = 15;
          const MAX_BAR_H = Math.max(...hash);
          const MIN_BAR_H = Math.min(...hash);
          const SCALE = 20;
          // canvas_width.value = (bar_width + bar_gap) * hash.length;
          // canvas_height.value = (max_bar_height + 3) * 2 + 10;

          function init(canvasId: string, color: [number, number, number]) {
            const canvas = document.querySelector(
              `canvas#${canvasId}`
            ) as HTMLCanvasElement;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
            for (let i = 0; i < hash.length; i++) {
              ctx.fillRect(
                i * (bar_width + bar_gap),
                0,
                bar_width,
                (hash[i] - MIN_BAR_H) * SCALE
              );
            }
            // window.requestAnimationFrame(draw);
          }

          init("canvas_pri", [200, 200, 200]);
          init("canvas_sec", [30, 0, 200]);
        });

      // function draw() {
      //   ctx.fillRect(30, 30, 50, 50);

      //   animationFrame = window.requestAnimationFrame(draw);
      // }
    });

    onUnmounted(() => {
      window.cancelAnimationFrame(animationFrame);
    });

    const globalState = useGlobalState();

    return {
      canvas_width,
      canvas_height,
      musicFullpath,
      progress,
      globalState
    };
  }
});
</script>

<style lang="scss"></style>
