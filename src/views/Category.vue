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
        <div class="w-52 h-52 shadow-2xl">
          <img
            v-if="musics.length > 0"
            class="w-full h-full object-cover"
            :src="musics[0].img"
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

    <div v-if="musics.length > 0">
      <div class="flex h-10 text-gray-400 text-sm px-10 mt-1">
        <div class="self-center w-5 text-rigth">#</div>
        <div class="w-10 mx-3 self-center">Title</div>
      </div>

      <hr class="border-gray-600 mx-5 mb-3" />

      <div
        class="flex text-gray-400 text-sm px-10 py-2 cursor-pointer hover:bg-white hover:bg-opacity-10 transition-all"
        v-for="(music, index) in musics"
        :key="music.id"
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
    </div>

    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { useRoute, useRouter } from "vue-router";
import { onMounted, defineComponent, ref, onUnmounted, reactive } from "vue";
import { mdiChevronLeft } from "@mdi/js";
import { ipcRenderer } from "electron";
import { fullRoute } from "@/components/frontEndUtils";
import { Music } from "@/schema";
import { emptyAndFillArray } from "@/helpers";
// import { Message } from "@/schema";
export default defineComponent({
  name: "Home",
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

    onUnmounted(() => {
      ipcRenderer.removeAllListeners(fullRoute.res("category"));
    });
    onMounted(() => {
      console.log("location:", location.href);
      // setTimeout(() => {
      ipcRenderer.send(fullRoute.req("category"), {
        payload: {
          categoryType: route.params.category,
          categoryName: route.params.tag
        }
      });
      // }, 2000);

      ipcRenderer.on(fullRoute.res("category"), (_, musicsFromServer) => {
        console.log(musicsFromServer);
        emptyAndFillArray(musics, musicsFromServer);
      });
    });

    function goBack() {
      router.go(-1);
    }

    return {
      musics,
      categoryType,
      categoryName,
      goBack,
      icons: { back: mdiChevronLeft }
    };
  }
});
</script>

<style lang="scss"></style>
