<template>
  <main class="bg-gray-800 text-center w-full overflow-y-scroll">
    <h1>sasdas</h1>
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
      <div id="progress-width" class="inline absolute left-0 overflow-hidden">
        <canvas
          id="canvas_sec"
          :width="canvas_width"
          :height="canvas_height"
        ></canvas>
      </div>
    </div>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
let animationFrame: number;

function hex10(ch: string) {
  switch (ch) {
    case "a":
      return 10;
    case "b":
      return 11;
    case "c":
      return 12;
    case "d":
      return 13;
    case "e":
      return 14;
    case "f":
      return 15;
    default:
      return Number(ch);
  }
}

export default defineComponent({
  name: "Home",
  setup() {
    const oldhash = "6881c9f94637c9f00595d2fdcbffb404";
    const hash: number[] = [];

    for (let i = 0; i < oldhash.length; i++) {
      const fletter = hex10(oldhash[i]);
      const sletter = oldhash[i + 1]
        ? hex10(oldhash[1 + i])
        : hex10(oldhash[i]) / 2;
      hash.push(fletter);
      hash.push((fletter + sletter) / 2);
    }
    console.log(hash);

    const bar_width = 4;
    const bar_gap = bar_width / 2;
    const max_bar_height = 15;
    const canvas_width = ref((bar_width + bar_gap) * hash.length);
    const canvas_height: number = (max_bar_height + 3) * 2 + 10;

    onMounted(() => {
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
            (hash[i] + 3) * 2
          );
        }
        // window.requestAnimationFrame(draw);
      }

      // function draw() {
      //   ctx.fillRect(30, 30, 50, 50);

      //   animationFrame = window.requestAnimationFrame(draw);
      // }

      init("canvas_pri", [200, 200, 200]);
      init("canvas_sec", [30, 0, 200]);
    });

    onUnmounted(() => {
      window.cancelAnimationFrame(animationFrame);
    });

    return {
      canvas_width,
      canvas_height
    };
  }
});
</script>

<style lang="scss"></style>
