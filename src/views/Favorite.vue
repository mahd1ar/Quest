<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <transition-group name="slide-up" tag="div" class="flex overflow-x-hidden">
      <div
        :style="`--count: ${index * 200}ms`"
        v-for="(music, index) in musics"
        :key="index"
        class="2xl:w-1/6 xl:w-1/5 lg:w-1/4 sm:w-1/3 px-3"
      >
        <span
          class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm"
        >
          <!-- <img class="rounded-md sm:m-2 lg:m-4 h-32 object-cover" :src="album.image" /> -->
          <div class="rounded-md sm:m-2 lg:m-4 h-32 overflow-hidden relative">
            <img
              class="hi w-full h-full object-cover relative"
              :src="music.img"
            />
          </div>
          <span class="capitalize px-2 font-bold text-blue-100">
            <h3
              class="text-lg text-blue-50 whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden"
            >
              {{ music.title }}
            </h3>
            <br />
            {{ music.artist }}
            <br />
            {{ music.album }}
          </span>
        </span>
      </div>
    </transition-group>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { Music } from "@/schema";
import { fillArray } from "@/helpers";
import { ipcRenderer } from "electron";

export default defineComponent({
  name: "Favorite",
  mixins: [],
  setup() {
    const musics: Music[] = reactive([]);
    onMounted(async () => {
      console.log("favorite monted");
      const favorites: Music[] = await ipcRenderer.invoke("favorite/all");
      console.log(favorites);
      fillArray(musics, favorites);
    });

    return {
      musics
    };
  }
});
</script>

<style lang="scss">
.rotateDown {
  animation-name: rotateDown;
}

@keyframes rotateDown {
  0% {
    opacity: 1;
    transform-origin: 0 0;
    transform: perspective(800px) rotateX(0deg) translateZ(0px);
  }

  100% {
    opacity: 0;
    transform-origin: 50% 100%;
    transform: perspective(800px) rotateX(-180deg) translateZ(300px);
  }
}

.slide-up {
  &-enter-active,
  &-leave-active {
    animation-direction: reverse;
    animation-name: rotateDown;
    animation-duration: 1500ms;
    // transition: all 1500ms cubic-bezier(0, 0, 0.1, 0.99);
    animation-delay: var(--count);
  }

  &-enter-from,
  &-leave-to {
    animation-name: rotateDown;
    // opacity: 0;
  }
}
</style>
