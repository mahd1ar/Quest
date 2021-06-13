<template>
  <div id="app" class="h-screen flex flex-col relative overflow-hidden reletive">
    <notification />
    <transition name="fade">
      <div
        id="welcome"
        v-if="!documentLoaded"
        class="bg-gray-900 flex justify-center items-center w-screen h-screen fixed inset-0 text-center text-blue-100 z-50 text-7xl"
      >Quest {{ ['👽','🎈','🍕','🤖','👾','😇'].sort(()=>Math.random() - Math.random())[0] }}</div>
    </transition>
    <div id="actionbar" class="w-full flex bg-gray-900 text-blue-200 justify-end items-center h-8">
      <div class="w-full" id="drag-area">.</div>
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

    <!-- <component :is="layout">
        <router-view />
    </component>-->

    <router-view v-slot="{ Component }">
      <!-- <transition name="fadeone" mode="in-out"> -->
      <component :is="layout">
        <component :is="Component" />
      </component>
      <!-- </transition> -->
    </router-view>

    <transition name="v">
      <player v-if="showPlayerBox" />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from "vue";
import { ipcRenderer } from "electron";
import { Message, Notification as Notif } from "@/schema";
import { useRoute } from "vue-router";
import Notification from "@/components/Notification.vue";
import { useStore } from "vuex";
import { mdiWindowMinimize, mdiWindowClose, mdiWindowMaximize } from "@mdi/js";
import Player from "@/components/PlayerBox.vue";

export default defineComponent({
  name: "App",
  components: { Notification, Player },
  setup() {
    const route = useRoute();
    const store = useStore();
    const documentLoaded = ref(false);
    const refreshIndex = ref(0);
    const questAlert = (params: Notif) => {
      store.dispatch("alert", params);
    };

    window.addEventListener("load", () => {
      setTimeout(() => {
        documentLoaded.value = true;
      }, 1000);
    });

    onMounted(() => {
      const libraries = localStorage.getItem("quest-user-libraries");
      // TODO: test without it
      if (libraries !== null) {
        ipcRenderer.send("quest-start", JSON.parse(libraries));
      }

      ipcRenderer.on("quest-notify", (_, params: Message) => {
        const msg: Message = {
          title: params.title,
          body: params.body,
          type: params.type
        };
        questAlert(msg);
      });
    });

    const icons = {
      minimize: mdiWindowMinimize,
      maximize: mdiWindowMaximize,
      close: mdiWindowClose
    };

    const showPlayerBox = computed(() => {
      return store.state.player.status !== "empty";
    });

    return {
      showPlayerBox,
      icons,
      documentLoaded,
      refreshIndex,
      actionbar: (action: "close" | "minimize" | "maximize") => {
        switch (action) {
          case "close":
            ipcRenderer.send("close-appication");
            break;
          case "minimize":
            ipcRenderer.send("minimize-appication");
            break;
          case "maximize":
            break;
        }
      },
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

.fadeone {
  &-enter-from,
  &-leave-to {
    transition: all 0.8s ease;
    opacity: 0;
    transform: translateY(150%);
    transform-origin: center bottom;
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    transform: translateY(0);
    opacity: 1;
  }

  &-enter-active,
  &-leave-active {
    inset: 0;
    position: absolute;
  }
}
</style>
