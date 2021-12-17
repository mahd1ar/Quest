<template>
  <main
    ref="scrollable"
    class="text-center text-white w-full overflow-y-scroll relative"
  >
    <div class="top-0 w-full h-72 relative" style="--count: 2" data-animation>
      <img
        class="w-full h-full object-cover"
        src="https://images.unsplash.com/photo-1524230659092-07f99a75c013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxfDB8MXxhbGx8fHx8fHx8fA&ixlib=rb-1.2.1&q=80&w=1080&utm_source=unsplash_source&utm_medium=referral&utm_campaign=api-credit"
      />
      <div
        class="absolute flex pl-10 items-center inset-0 w-full h-full bg-gray-900 bg-opacity-30"
      >
        <h1 class="text-4xl capitalize">
          good
          {{ time }}
        </h1>
      </div>
    </div>

    <!-- empty screen! -->
    <div
      v-show="musics.length === 0"
      class="bg-inherit w-full h-full absolute inset-0 flex flex-col justify-center items-center"
    >
      <div class="text-lg">No music found</div>
      <div class="text-base text-gray-400">
        To add a new library, navigate to settings > add library
      </div>
    </div>

    <grid-style-items
      :items="musics"
      name="albums"
      initial-style="transform: translateY(-100%); opacity: 1;"
      @on-select="play($event)"
      :batch-action="true"
    />
    <!-- @clicked="lsCategory('album', $event[0].name, $event[0].image)" -->

    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { VuexState, Music } from "@/schema";
import { useStore } from "vuex";
// @ts-ignore
import anime from "animejs/lib/anime.es.js";
import { useRouter } from "vue-router";
import { uniqBy } from "lodash";
import GridStyleItems from "@/components/GridStyleItems.vue";

const t = new Date().getHours();

const time =
  4 <= t && t <= 10
    ? "morning"
    : 11 <= t && t <= 16
    ? "after noon"
    : 17 <= t && t < 21
    ? "evening"
    : "night";

// const dripAnimation = (
//   targetIndex: number,
//   reverseDirection: boolean,
//   onComplete?: Function
// ) => {
//   anime({
//     targets: `.artist-cover-${targetIndex}`,
//     easing: "easeInOutSine",
//     keyframes: reverseDirection
//       ? [
//           { clipPath: "circle(0% at 50% 50%)" },
//           { clipPath: "circle(100% at 50% 50%)" }
//         ]
//       : [
//           { clipPath: "circle(100% at 50% 50%)" },
//           { clipPath: "circle(0% at 50% 50%)" }
//         ],
//     duration: 1000,
//     delay: 100 * targetIndex,
//     complete: () => {
//       onComplete && onComplete();
//     }
//   });
// };

export default defineComponent({
  name: "Home",
  components: { GridStyleItems },
  setup() {
    const router = useRouter();
    const store = useStore<VuexState>();

    const lsCategory = (
      categoryType: string,
      categoryName: string,
      categoryImage: string = ""
    ) => {
      router.push({
        name: "category",
        params: { categoryType, categoryName, categoryImage }
      });
    };

    // <>
    const musics = computed(() => store.state.library.list);

    const albums = computed(() => uniqBy(store.state.library.list, "album"));

    const artists = computed(() => uniqBy(store.state.library.list, "artist"));

    const play = ([music]: [Music, number]) => {
      console.log(music);
      store.dispatch("player/playPlaylist", [music.id]);
    };

    // const scrollable = ref<HTMLElement | null>(null);
    // const { arrivedState } = useScroll(scrollable);

    return {
      // scrollable,
      // // x,
      // arrivedState,
      // // isScrolling,
      play,
      musics,
      albums,
      artists,
      lsCategory,
      time,
      log: (e: any) => {
        console.log(e);
      }
    };
  }
});
</script>

<style lang="scss">
.bg-inherit {
  background: inherit;
}

._3-line-3-dots {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
