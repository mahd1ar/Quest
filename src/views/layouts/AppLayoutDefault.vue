<template>
  <div class="flex h-full overflow-hidden relative" id="default-layout">
    <div class="w-full xl:w-3/12 sm:w-4/12 bg-black text-white flex flex-col">
      <div class="w-full p-5">
        <!-- <img
          src="//s22.q4cdn.com/540910603/files/design/Spotify_Logo_White.png"
          class="inline"
          alt="logo"
        />-->
        <h1 class="text-5xl text-gray-400">Quest</h1>
      </div>
      <div class="px-3">
        <ul>
          <router-link
            to="/"
            class="px-2 flex items-center rounded-sm capitalize"
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
            <span class="px-4">home</span>
          </router-link>

          <router-link
            to="/search"
            class="text-gray-400 hover:bg-opacity-10 hover:bg-white px-2 flex items-center rounded-sm capitalize"
          >
            <svg
              width="24px"
              height="48px"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-search"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span class="px-4">search</span>
          </router-link>

          <li
            class="text-gray-400 hover:bg-opacity-10 hover:bg-white px-2 flex items-center rounded-sm capitalize cursor-pointer"
          >
            <svg
              class="fill-current"
              x="0px"
              y="0px"
              width="24px"
              height="48px"
              viewBox="0 0 32 32"
              style="enable-background:new 0 0 32 32;"
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

            <span class="px-4">your library</span>
          </li>
        </ul>
      </div>

      <div class="px-3 py-3">
        <ul>
          <router-link
            to="/favorite"
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
              <path :d="icons.like" />
            </svg>
            <span class="px-4">liked songs</span>
          </router-link>
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
            <span class="px-4">settings</span>
          </router-link>
        </ul>
      </div>
      <transition name="stretched" mode="out-in">
        <!-- GAP -->
        <div class="gap" v-show="$store.state.player.status !== 'empty'"></div>
      </transition>
    </div>
    <slot />
  </div>
</template>

<script>
import { mdiHeart, mdiCog } from "@mdi/js";
export default {
  name: "AppLayoutDefault",
  setup() {
    return {
      icons: { like: mdiHeart, settings: mdiCog }
    };
  }
};
</script>

<style lang="scss">
.router-link-active {
  @apply bg-gray-700 text-gray-100 w-full h-full;
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
</style>
