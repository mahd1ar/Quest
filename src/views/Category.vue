<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <div class="gradient-target">
      <div class="text-left px-10 mt-8">
        <div class="relative" @click="$router.go(-1)">
          <svg
            width="100%"
            height="100%"
            fill="#fff"
            viewBox="0 0 24 24"
            stroke
            class="w-10 h-10 cursor-pointer relative -left-2"
          >
            <path :d="icons.back" />
          </svg>
        </div>
      </div>
      <div class="flex pt-20 px-10 pb-5">
        <div class="w-52 h-52 shadow-2xl overflow-hidden">
          <transition name="slide-right">
            <img
              v-if="musics.length > 0"
              class="image-target w-full h-full object-cover"
              :src="categoryImage || musics[0].img"
              alt
            />
          </transition>
        </div>
        <transition name="fade-left">
          <div
            v-if="musics.length > 0"
            :style="{
              backgroundColor: `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`
            }"
            class="inner-text text-white self-end ml-9 flex-1 w-full text-left"
          >
            <div class="text-sm uppercase">{{ categoryType }}</div>
            <div class="text-5xl mt-1">{{ categoryName }}</div>
          </div>
        </transition>
      </div>
    </div>

    <div>
      <div class="flex h-10 text-gray-400 text-sm px-10 mt-1">
        <div class="self-center w-5 text-rigth">#</div>
        <div class="w-10 mx-3 self-center">Title</div>
      </div>

      <hr class="border-gray-600 mx-5 mb-3" />

      <transition-group name="category-list" tag="div" mode="out-in">
        <div
          :style="`--count: ${index * 200}ms`"
          class="flex text-gray-400 text-sm px-10 py-2 cursor-pointer hover:bg-white hover:bg-opacity-10"
          v-for="(music, index) in musics"
          :key="music.id"
          @click="playMusic(music)"
        >
          <div class="self-center w-5 text-rigth">{{ index + 1 }}</div>
          <div class="w-10 h-10 mx-3 object-cover">
            <img class="w-full h-full" :src="music.img" alt />
          </div>
          <div class="text-left">
            <div class="text-blue-50">{{ music.title }}</div>
            <div>{{ music.artist }}, {{ music.album }}</div>
          </div>
        </div>
      </transition-group>
    </div>
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import { mdiChevronLeft } from "@mdi/js";
import { Music } from "@/schema";
import { fillArray } from "@/helpers";
import { mapActions } from "vuex";
import { getAverageRGB } from "@/components/frontEndUtils";
// const { lifeCycleMixin } = require("@/components/mixins");
// @ts-ignore
import anime from "animejs/lib/anime.es.js";
import { ipcRenderer } from "electron";

export default defineComponent({
  name: "Category",
  // mixins: [lifeCycleMixin],
  props: ["categoryType", "categoryName", "categoryImage"],
  setup(props) {
    const musics: Music[] = reactive([]);
    const colors: number[] = reactive([0, 0, 0]);

    // linear-gradient(to top, rgb(236, 72, 153), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))

    //   whenever(or(props.categoryType, props.categoryName), () => {
    //   console.log('either a or b is truthy!')
    // })

    onMounted(async () => {
      const musicsFromServer: Music[] = await ipcRenderer.invoke("category", {
        payload: {
          categoryType: props.categoryType,
          categoryName: props.categoryName
        }
      });

      console.log("getMusicsOfCategory", musicsFromServer);
      fillArray(musics, musicsFromServer);

      setTimeout(() => {
        const target = getAverageRGB(
          document.querySelector(".image-target") as HTMLImageElement
        );

        Object.values(target).forEach((i, index) => {
          colors[index] = i;
        });

        const handler = document.querySelector(
          ".gradient-target"
        ) as HTMLDivElement;

        const rgb = { r: 31, g: 41, b: 55 };

        anime({
          targets: rgb,
          r: target.r,
          g: target.g,
          b: target.b,
          round: 1,
          duration: 2900,
          easing: "linear",
          update: function() {
            handler.style.background = `linear-gradient(to top, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))`;
          }
        });
      }, 2300);
    });

    return {
      ...mapActions(["playMusic"]),
      log: () => {
        console.log(arguments);
      },
      colors,
      musics,
      icons: { back: mdiChevronLeft }
    };
  }
});
</script>

<style lang="scss" scoped>
.category-list {
  // &-item {
  //   transition-delay: var(--count);
  // }

  &-enter-active,
  &-leave-active {
    // transition-delay: var(--count);
    transition: all 1s ease;
    transition-delay: var(--count);
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    // transform: translateY(100%);
  }
}
.slide-right {
  &-enter-active,
  &-leave-active {
    // transition-delay: var(--count);
    transition: all 1500ms cubic-bezier(0, 0, 0.1, 0.99);
  }

  &-enter-from,
  &-leave-to {
    margin-left: 100%;
  }
}
.fade-left {
  &-enter-active,
  &-leave-active {
    transition: all 1s ease-out; //cubic-bezier(0, 0, 0.1, 0.99);
  }

  &-enter-from,
  &-leave-to {
    transform: translateX(-25px);
    opacity: 0;
  }
}

.inner-text {
  position: relative;
  -webkit-background-clip: text;
  color: transparent;
  // -webkit-filter: invert() sepia();
  filter: #{"invert()"} sepia();
  transition: all 1s ease-out;
}
</style>
