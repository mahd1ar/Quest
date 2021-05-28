<template>
  <div id="app">
    <button class="top-0 left-0 fixed bg-red-100 z-10" @click="justDoIt">
      aDD
    </button>
    <notification />
    <component :is="layout">
      <!-- <transition name="fade" mode="out-in"> -->
      <router-view />
      <!-- </transition> -->
    </component>

    <audio ref="nativePlayer" class="hidden" id="native-player"></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref, reactive } from "vue";
import { ipcRenderer } from "electron";
import { Message, Notification as Notif } from "@/schema";
import { useRoute } from "vue-router";
import Notification from "@/components/Notification.vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "App",
  components: { Notification },
  setup() {
    const route = useRoute();
    const nativePlayer = ref(null);
    const store = useStore();

    const questAlert = (params: Notif) => {
      store.dispatch("alert", params);
    };

    onMounted(() => {
      const libraries = localStorage.getItem("quest-user-libraries");

      if (libraries !== null) {
        ipcRenderer.send("quest-start", JSON.parse(libraries));
      }

      ipcRenderer.on("quest-notify", (_, params: Message) => {
        questAlert({
          title: params.title,
          body: params.body,
          type: params.type
        });
        // if (!Array.isArray(params.message))
        //   questAlert({ title: params.message });
        // else params.message.forEach(i => questAlert({ title: i }));
      });
    });

    // for test
    const justDoIt = () => {
      let letters = "ABCDEFJHIJKMNLPQRSTUVWXYZ";
      letters += letters.toLowerCase();
      letters += "\n";
      letters += " ";
      letters
        .split("")
        .sort(() => {
          return Math.random();
        })
        .join("");
      questAlert({
        title: letters,
        // @ts-ignore
        type: ["error", "success", "warn", "log"][
          Math.floor(Math.random() * 10) % 4
        ]
      });
    };

    return {
      nativePlayer,
      justDoIt,
      layout: computed(() => route.meta.layout || "deflayout")
    };
  }
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400;1,600&display=swap");

#app {
  user-select: none;
  // -webkit-app-region: drag
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
</style>
