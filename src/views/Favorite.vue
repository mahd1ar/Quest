<template>
  <main class="text-center text-red-100 w-full overflow-y-scroll">
    <div class="flex justify-center items-center">
      <div class="w-16" ref="heartIconRef"></div>
      <h1 class="text-4xl text-white">Favorites</h1>
    </div>
    <transition-group name="slide-up" tag="div" class="flex overflow-x-hidden">
      <div
        :style="`--count: ${index * 200}ms`"
        v-for="(music, index) in favorites"
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
import { defineComponent, computed, onMounted, Ref, ref } from "vue";
import { VuexState, Music } from "@/schema";
import { useStore } from "vuex";
import Lottie from "lottie-web";
import { timeout } from "@/helpers";

export default defineComponent({
  name: "Favorite",
  setup() {
    const store = useStore<VuexState>();
    //  let heartIcon: AnimationItem;
    const heartIconRef: Ref<any> = ref(null);
    // const heartIconHalt = ref(false);

    const favorites = computed<Music[]>(
      () => store.getters["library/favorites"]
    );

    onMounted(async () => {
      const lottie = Lottie.loadAnimation({
        container: heartIconRef.value as Element,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "favorite1.json"
      });
      await timeout(1000);
      lottie.play();
    });

    return {
      favorites,
      heartIconRef
      // ...mapGetters({
      //   favorites: "library/favorites",
      // }),
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
