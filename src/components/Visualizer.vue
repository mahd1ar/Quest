<template>
  <div class="visualizer w-full h-full relative">
    <div class="canvas-placeholder">
      <div
        id="show-case"
        class="absolute inset-0 flex flex-col w-full h-full justify-center items-center"
      >
        <div class="flex p-10 w-full">
          <div class="h-48 w-48 mx-5 flex-grow-0 flex-shrink-0">
            <img :src="music.img" class="object-cover w-full h-full" />
          </div>
          <div class="mx-5 self-end overflow-hidden w-full flex flex-col">
            <div
              id="scroll-title-parent"
              ref="parent"
              class="whitespace-nowrap relative"
            >
              <h1
                id="scroll-title"
                ref="child"
                class="text-white text-6xl relative left-0"
                @click="goBack"
              >
                {{ music.title || "back" }}
              </h1>
            </div>
            <h4 class="text-white text-3xl font-roboto">{{ music.artist }}</h4>
            <progress-component
              class="h-2 mt-3"
              :percentage="seek"
              twfrom="purple-400"
              twto="pink-600"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useEventListener } from "@vueuse/core";
import Progress from "@/components/Progress.vue";
import { emitter } from "./frontEndUtils";
import { timeout } from "@/helpers";

export default defineComponent({
  name: "Visualizer",
  components: { "progress-component": Progress },
  beforeRouteLeave: (to, from, next) => {
    emitter.emit("overlay", {
      status: true,
      ttl: 800,
      bgColor: "bg-black",
      callback: () => {
        next();
        emitter.emit("overlay", { status: false, ttl: 1800 });
      }
    });
  },
  beforeRouteEnter: (to, from, next) => {
    emitter.emit("overlay", {
      status: true,
      ttl: 800,
      bgColor: "bg-black",
      callback: () => {
        next();
        emitter.emit("overlay", { status: false, ttl: 1800 });
      }
    });
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const child = ref<HTMLDivElement>();
    const parent = ref<HTMLDivElement>();

    const seek = ref(50);
    let seekref: number;

    const scroll = () => {
      const scrollWidth = parent.value!.scrollWidth;
      const offsetWidth = child.value!.offsetWidth;
      let diff = scrollWidth - offsetWidth;
      console.log({ diff });
      if (diff > 0) {
        const duration = Number((diff / 70).toFixed(2)) * 1000;
        child.value!.style.transitionProperty = "all";
        child.value!.style.transitionDuration = duration + "ms";
        child.value!.style.transitionTimingFunction = "ease";
        child.value!.style.left = diff * -1 + "px";

        setTimeout(() => {
          child.value!.style.left = "0px";
          child.value!.style.transitionDuration = "0ms";
          setTimeout(() => {
            scroll();
          }, 10000);
        }, duration + 5000);
      }
    };

    onMounted(async () => {
      const x = "./canvas";

      seekref = window.setInterval(() => {
        seek.value++;

        if (seek.value === 100) clearInterval(seekref);
      }, 1000);

      // store.dispatch("canvasDidMount", true);
      store.dispatch("hideMusicPanel", true);

      await timeout(1800);
      const { setup, resize } = await import(x);
      setup();
      useEventListener(window, "resize", resize);
      await timeout(1000);
      scroll();
    });

    onUnmounted(async () => {
      // store.dispatch("canvasDidMount", false);
      store.dispatch("hideMusicPanel", false);
      const { stop } = await import("@/components/canvas.ts");

      stop();
    });

    const goBack = () => {
      console.log(history.state.back);

      if (history.state.back) {
        router.push(history.state.back);
      } else {
        router.push("/");
      }
    };

    const music = computed(() => {
      return store.getters.currentMusic;
    });

    return { goBack, music, seek, child, parent };
  }
});
</script>

<style lang="scss" scoped>
.visualizer {
  background: hsla(260, 40%, 5%, 1);
}
</style>
