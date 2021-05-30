<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    <div class="bg-gradient-to-t from-pink-500 via-transparent">
      <div class="text-left px-10 mt-8">
        <div class="relative">
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
        <div class="w-52 h-52 shadow-2xl">
          <img
            class="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1621446044212-0a47c121fe94?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max"
            alt
          />
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

      <div
        class="flex text-gray-400 text-sm px-10 py-2 cursor-pointer hover:bg-white hover:bg-opacity-10 transition-all"
        v-for="i in [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          118
        ]"
        :key="i"
      >
        <div class="self-center w-5 text-rigth">{{ i }}</div>
        <div class="w-10 h-10 mx-3 object-cover">
          <img
            class="w-full h-full"
            src="https://images.unsplash.com/photo-1621446044212-0a47c121fe94?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max"
            alt
          />
        </div>
        <div class="text-left">
          <div class="text-blue-50">Boys - DROELOE Remix</div>
          <div>Charli XCX, DROELE</div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { useRoute } from "vue-router";
import { onMounted, defineComponent, ref } from "vue";
import { mdiChevronLeft } from "@mdi/js";
import { ipcRenderer } from "electron";
import { fullRoute } from "@/components/frontEndUtils";

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRoute();
    const categoryType = ref("");
    const categoryName = ref("");

    categoryType.value = !Array.isArray(router.params.category)
      ? router.params.category
      : router.params.category[0];

    categoryName.value = !Array.isArray(router.params.tag)
      ? router.params.tag
      : router.params.tag[0];

    // categoryName.value = "unknown"

    onMounted(() => {
      setTimeout(() => {
        ipcRenderer.send(fullRoute.req("album_select"));
      }, 2000);
      // ipcRenderer.send(fullRoute.req("album.select"), "unknown");
      console.log(router.params);

      ipcRenderer.on(fullRoute.res("album_select"), (_, e) => {
        console.log("x", e);
      });
    });

    return {
      categoryType,
      categoryName,
      icons: { back: mdiChevronLeft }
    };
  }
});
</script>

<style lang="scss"></style>
