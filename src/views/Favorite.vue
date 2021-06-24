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
import { defineComponent, reactive } from "vue";
import { Listener } from "@/components/frontEndUtils";
import { Music } from "@/schema";
import { emptyAndFillArray } from "@/helpers";
const { lifeCycleMixin } = require("@/components/mixins");

export default defineComponent({
  name: "Home",
  mixins: [lifeCycleMixin],
  setup() {
    const musics: Music[] = reactive([]);
    const listener = new Listener();

    listener.register(
      "favorites",
      "favorite/all",
      (_: any, params: Music[]) => {
        console.log(params);
        emptyAndFillArray(musics, params);
      },
      true
    );

    return {
      musics,
      getListeners: () => {
        return listener;
      }
    };
  }
});
</script>

<style lang="scss">
.slide-up {
  &-enter-active,
  &-leave-active {
    transition: all 1500ms cubic-bezier(0, 0, 0.1, 0.99);
    transition-delay: var(--count);
  }

  &-enter-from,
  &-leave-to {
    transform: translateY(30px);
    opacity: 0;
  }
}
</style>
