<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <div class="bg-gradient-to-t from-pink-500 via-transparent">
      <div class="text-left px-10 mt-8">
        <div class="relative" @click="goBack">
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
      <div class="flex pt-24 px-10 pb-5">
        <div class="w-52 h-52 shadow-2xl overflow-hidden">
          <transition name="slide-left">
            <img
              v-if="musics.length > 0"
              class="w-full h-full object-cover"
              :src="musics[0].img"
              alt
            />
          </transition>
        </div>
        <div class="text-white self-end ml-9 flex-1 w-full text-left">
          <div class="text-sm uppercase">{{ categoryType }}</div>
          <div class="text-5xl mt-1">{{ categoryName }}</div>
          <div class="text-sm mt-3">Mark Francis Carandang</div>
        </div>
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
          :style="`--count: ${index*130}ms`"
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
import { useRoute, useRouter } from "vue-router";
import { defineComponent, ref, reactive } from "vue";
import { mdiChevronLeft } from "@mdi/js";
import { ipcRenderer } from "electron";
import { Music } from "@/schema";
import { emptyAndFillArray } from "@/helpers";
import { mapActions } from "vuex";
import { Listener } from "@/components/frontEndUtils";
import { setTimeout } from "timers";
const { componentMixin } = require("@/components/mixins");

export default defineComponent({
  name: "Home",
  mixins: [componentMixin],
  setup() {
    const router = useRouter();
    const route = useRoute();

    const categoryType = ref("");
    const categoryName = ref("");
    const musics: Music[] = reactive([]);

    categoryType.value = !Array.isArray(route.params.category)
      ? route.params.category
      : route.params.category[0];

    categoryName.value = !Array.isArray(route.params.tag)
      ? route.params.tag
      : route.params.tag[0];
    const listeners = new Listener();
    listeners.register(
      "category",
      (_: any, musicsFromServer: Music[]) => {
        console.log(musicsFromServer);
        emptyAndFillArray(musics, musicsFromServer);
      },
      true,
      {
        payload: {
          categoryType: route.params.category,
          categoryName: route.params.tag
        }
      }
    );

    function goBack() {
      router.go(-1);
    }
    function getListeners() {
      return listeners;
    }

    return {
      ...mapActions(["playMusic"]),
      getListeners,
      musics,
      categoryType,
      categoryName,
      goBack,
      icons: { back: mdiChevronLeft }
    };
  }
});
</script>

<style lang="scss" scoped >
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
.slide-left {
  // &-item {
  //   transition-delay: var(--count);
  // }

  &-enter-active,
  &-leave-active {
    // transition-delay: var(--count);
    transition: all 1s cubic-bezier(0, 0, 0.1, 0.99);
  }

  &-enter-from,
  &-leave-to {
    margin-left: 100%;
  }
}
</style>
