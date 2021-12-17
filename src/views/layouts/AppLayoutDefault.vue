<template>
  <div id="default-layout" class="flex h-full overflow-hidden relative">
    <nav class="w-20 text-white flex flex-col">
      <!-- <div class="w-full px-3 py-5 flex justify-center">
        <h1 class="text-5xl text-gray-400">Q</h1>
      </div> -->

      <div class="px-3 mt-auto">
        <ul>
          <li>
            <router-link
              to="/"
              class="px-2 items-center text-gray-400 rounded-sm capitalize flex justify-center"
            >
              <svg
                class="fill-current"
                viewBox="0 0 48 48"
                width="24px"
                height="48px"
              >
                <path
                  d="M39.5,43h-9c-1.381,0-2.5-1.119-2.5-2.5v-9c0-1.105-0.895-2-2-2h-4c-1.105,0-2,0.895-2,2v9c0,1.381-1.119,2.5-2.5,2.5h-9	C7.119,43,6,41.881,6,40.5V21.413c0-2.299,1.054-4.471,2.859-5.893L23.071,4.321c0.545-0.428,1.313-0.428,1.857,0L39.142,15.52	C40.947,16.942,42,19.113,42,21.411V40.5C42,41.881,40.881,43,39.5,43z"
                />
              </svg>
            </router-link>
          </li>

          <li class>
            <router-link
              class="flex justify-center text-gray-400 hover:bg-opacity-10 hover:bg-white px-2 rounded-sm capitalize cursor-pointer"
              to="/test"
            >
              <svg
                class="fill-current"
                x="0px"
                y="0px"
                width="24px"
                height="48px"
                viewBox="0 0 32 32"
                style="enable-background: new 0 0 32 32"
                xml:space="preserve"
              >
                <path
                  d="M28.9,9.4C28.9,9.4,28.9,9.4,28.9,9.4C28.9,9.3,29,9.2,29,9.1c0,0,0,0,0-0.1c0,0,0,0,0-0.1c0-0.1,0-0.2,0-0.3c0,0,0,0,0-0.1
              c0-0.1-0.1-0.2-0.1-0.3c0,0,0,0,0,0c-0.1-0.1-0.1-0.1-0.2-0.2l-11-7c-0.3-0.2-0.8-0.2-1.1,0l-13,9c0,0-0.1,0.1-0.1,0.1
              c0,0,0,0-0.1,0c-0.1,0.1-0.1,0.2-0.2,0.3c0,0,0,0,0,0.1C3,10.8,3,10.9,3,11c0,0,0,0,0,0v6v6c0,0.3,0.2,0.7,0.5,0.8l11,7
              c0.2,0.1,0.4,0.2,0.5,0.2c0.2,0,0.4-0.1,0.6-0.2l13-9c0.2-0.2,0.4-0.4,0.4-0.7s-0.1-0.6-0.3-0.8c-0.9-0.9-1.1-2.2-0.5-3.4l0.7-1.5
              c0-0.1,0.1-0.2,0.1-0.3c0,0,0-0.1,0-0.1c0,0,0,0,0,0c0-0.1,0-0.3-0.1-0.4c0,0,0-0.1,0-0.1c0-0.1-0.1-0.2-0.2-0.3c0,0,0,0,0,0
              c-0.9-0.9-1.1-2.2-0.5-3.4L28.9,9.4z M26.6,14.8l-11.6,8L5,16.5v-3.6l9.5,6c0.2,0.1,0.4,0.2,0.5,0.2c0.2,0,0.4-0.1,0.6-0.2l10.3-7.1
              C25.8,12.8,26,13.8,26.6,14.8z M15,28.8L5,22.5v-3.6l9.5,6c0.2,0.1,0.4,0.2,0.5,0.2c0.2,0,0.4-0.1,0.6-0.2l10.3-7.1
              c-0.1,1.1,0.1,2.2,0.7,3.1L15,28.8z"
                />
              </svg>
            </router-link>
          </li>
          <li>
            <router-link
              to="/favorite"
              class="text-gray-400 hover:bg-opacity-10 hover:bg-white px-2 flex justify-center rounded-sm capitalize cursor-pointer"
            >
              <svg
                width="24px"
                height="48px"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="icons.like" />
              </svg>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="px-3 py-3 mt-auto">
        <ul>
          <router-link
            to="/setting"
            class="text-gray-400 hover:bg-opacity-10 hover:bg-white px-2 flex items-center rounded-sm capitalize cursor-pointer"
          >
            <svg
              width="24px"
              height="48px"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path :d="icons.settings" />
            </svg>
          </router-link>
        </ul>
      </div>
    </nav>

    <slot />
    <div class>
      <!-- <transition name="player"> -->
      <controller />
      <!-- </transition> -->
    </div>
  </div>
</template>

<script lang="ts">
import { mdiHeart, mdiCog } from "@mdi/js";
import { defineComponent, ref, onMounted } from "vue";
import Controller from "@/components/Controller.vue";

export default defineComponent({
  name: "AppLayoutDefault",
  components: { Controller },
  setup() {
    const t = new Date().getHours();

    const time =
      4 <= t && t <= 10
        ? "morning"
        : 11 <= t && t <= 16
        ? "after noon"
        : 17 <= t && t < 21
        ? "evening"
        : "night";

    return {
      icons: { like: mdiHeart, settings: mdiCog, time }
    };
  }
});
</script>

<style lang="scss">
.router-link-active {
  @apply text-gray-100 w-full h-full;
  background: none;
}

// .link {
// }

.gap {
  min-height: 6rem;
}

.stretched {
  &-enter-from,
  &-leave-to {
    transition: all 0.8s ease;
    min-height: 0rem;
  }

  &-leave-from,
  &-enter-to {
    transition: all 0.8s ease;
    min-height: 6rem;
  }
}

#default-layout {
  @apply bg-gray-900 text-gray-600;
  // &::before {
  //   content: "Q";
  //   @apply absolute flex justify-center items-center w-full h-full text-center text-4xl pointer-events-none z-0;
  // }
}
</style>
