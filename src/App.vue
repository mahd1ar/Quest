<template>
  <div
    id="app"
    class="h-screen flex flex-col relative overflow-hidden reletive"
  >
    <!-- <notification /> -->
    <transition name="fade">
      <!-- v-if="veilUp" -->
      <veil class="fixed" v-model:show="veilUp" />
    </transition>
    <div
      id="actionbar"
      class="w-full flex bg-gray-900 text-blue-200 justify-end items-center h-8"
    >
      <div class="ml-4" id="popup-target"></div>
      <div class="w-full text-gray-900" id="drag-area">.</div>
      <div class="flex">
        <div
          v-for="(path, name) in icons"
          :key="name"
          class="p-3 w-10 text-center inline-flex justify-center items-center hover:bg-blue-100 hover:bg-opacity-10 cursor-pointer"
          @click="actionbar(name)"
        >
          <svg width="100%" height="100%" fill="#fff" viewBox="0 0 24 24">
            <path :d="path" />
          </svg>
        </div>
      </div>
    </div>

    <component :is="layout">
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <!-- <keep-alive :exclude="dontKeepThisAlive" :key="refreshIndex"> -->
          <component :is="Component" />
          <!-- </keep-alive> -->
        </transition>
      </router-view>
    </component>

    <transition name="v">
      <controller />
      <!-- <player v-if="renderPlayerBox" :class="{ hidden: !showPlayerBox }" /> -->
    </transition>
    <transition name="vfade">
      <div
        v-if="overlay.status"
        :style="{ transition: `all ${overlay.ttl}ms ease` }"
        class="overlay absolute w-full h-full inset-0"
        :class="`${overlay.bgColor}`"
      ></div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  computed,
  ref,
  watch,
  reactive
} from "vue";
import { ipcRenderer } from "electron";
import { Music } from "@/schema";
import { useRoute } from "vue-router";
// import Notification from "@/components/Notification.vue";
import { useStore } from "vuex";
import { mdiWindowMinimize, mdiWindowClose, mdiWindowMaximize } from "@mdi/js";
import { useEventListener, useStorage } from "@vueuse/core";
import Veil from "@/components/Veil.vue";
import { emitter } from "./components/frontEndUtils";
import {
  FrontEndListeners,
  BackEndListeners,
  LocalStorage
} from "./schema/Enums";

import { VuexState } from "@/schema";
import Favorites from "./database/Favorites";
import Controller from "./components/Controller.vue";

export default defineComponent({
  name: "App",
  components: { Controller, Veil },
  setup() {
    const store = useStore<VuexState>();
    const route = useRoute();
    let musicIndex = 0;
    const veilUp = ref(false);
    const overlay = reactive({
      status: false,
      bgColor: "bg-blue-900",
      ttl: 800
    });
    // const homePageLoaded = ref(true); // TODO: implement this later

    useEventListener(window, "load", () => {
      setTimeout(() => {
        veilUp.value = true;
      }, 1000);
    });

    const reactiveLibraries = useStorage(LocalStorage.libraries, "[]");

    watch(reactiveLibraries, (value, oldValue) => {
      console.log(oldValue, "==>", value);
      // ipcRenderer.send(BackEndListeners.buildDatabase)
    });

    ipcRenderer.on(FrontEndListeners.dumpLibrary, () => {
      store.dispatch("library/dump");
    });

    ipcRenderer.on(
      FrontEndListeners.addToLibrary,
      (_, music: Music | Music[]) => {
        if (!Array.isArray(music)) {
          music.id = musicIndex++;
          const favorite = new Favorites();
          const f = favorite.get(music.hash);
          if (f !== false) music.favorite = true;

          console.log(music);
          store.dispatch("library/add", music);
        } else {
          const favorite = new Favorites();
          favorite.load();
          music.forEach(m => {
            m.id = musicIndex++;
            const f = favorite.get(m.hash);
            if (f !== false) m.favorite = true;
            console.log(m);
            store.dispatch("library/add", m);
          });
        }
      }
    );

    ipcRenderer.on(FrontEndListeners.deleteFromLibrary, (_, music: Music) => {
      const favorite = new Favorites();
      const f = favorite.get(music.hash);
      if (f !== false) favorite.remove({ key: f });

      console.log("removed", music);
      store.dispatch("library/remove", music.hash);
    });

    onMounted(() => {
      emitter.on("overlay", e => {
        const o_bgColor = "bg-black";
        const o_ttl = 800;

        Object.assign(overlay, {
          status: e.status,
          bgColor: e.bgColor || o_bgColor,
          ttl: e.ttl || o_ttl
        });

        setTimeout(() => {
          e.callback && e.callback();
        }, overlay.ttl);
      });

      emitter.on("veilup", e => {
        veilUp.value = e;
      });

      ipcRenderer.send(
        BackEndListeners.start,
        ["C:\\Users\\User\\Music"]
        // reactiveLibraries.value.split(",")
      );
    });

    const icons = {
      minimize: mdiWindowMinimize,
      maximize: mdiWindowMaximize,
      close: mdiWindowClose
    };

    const renderPlayerBox = computed(
      () => store.state.player.status !== "empty"
    );

    const showPlayerBox = computed(() => store.state.player.isVisible);

    // const dontKeepThisAlive = computed(() =>
    //   router
    //     .getRoutes()
    //     .filter(i => !i.meta.keepAlive)
    //     .map(i => capitalize(<string>i.name!))
    //     .join(",")
    // );

    const actionbar = (action: "close" | "minimize" | "maximize") => {
      switch (action) {
        case "close":
          ipcRenderer.send("close-appication");
          break;
        case "minimize":
          ipcRenderer.send("minimize-appication");
          break;
        default:
          break;
      }
    };

    // im><back

    return {
      overlay,
      // dontKeepThisAlive,
      renderPlayerBox,
      showPlayerBox,
      icons,
      // refreshIndex,
      veilUp,
      actionbar,
      layout: computed(() => route.meta.layout || "deflayout")
    };
  }
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400;1,600&display=swap");

#app {
  user-select: none;
}
#actionbar {
  #drag-area {
    -webkit-app-region: drag;
  }
}
.router-link-active {
  background: #000;
}

/* width */
::-webkit-scrollbar {
  width: 20px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.144);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.in-page {
  background-color: #f8f8f8;
}

.fade {
  &-enter-from,
  &-leave-to {
    transition: all 0.8s ease;

    transform: translateY(-100%);
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    transform: translateY(0);
  }
}

.route {
  &-enter-from {
    transition: all 0.8s ease;
    transform: translateY(100%);
    .p-3 {
      opacity: 1;
      // transition: all 0.4s ease;
      // transition-delay: var(--delay, 1000ms);
    }
  }

  &-leave-to {
    transition: all 0.8s ease;
    transform: translateY(-100%);
    .p-3 {
      opacity: 0;
      transition: all 0.4s ease;
      transition-delay: var(--delay, 1000ms);
    }
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    transform: translateY(0);
    .p-3 {
      // transition: all 1.4s ease;
      // transition-delay: var(--delay, 1000ms);
      opacity: 1;
    }
  }
}

.v {
  &-enter-from,
  &-leave-to {
    transition: all 0.8s ease;
    opacity: 0;
    transform: translateY(150%) scale(0.8);
    transform-origin: center bottom;
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  &-enter-active,
  &-leave-active {
    position: absolute;
  }
}

.vfade {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-leave-from,
  &-enter-to {
    opacity: 1;
  }
}
</style>
