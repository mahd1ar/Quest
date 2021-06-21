<template>
  <main class="bg-gray-800 text-center w-full overflow-y-scroll">
    <section class="text-gray-300 body-font relative mt-24">
      <div class="container px-5 mx-auto">
        <div class="flex flex-col text-center w-full mb-12">
          <h1
            class="sm:text-2xl text-xl tracking-wider font-medium title-font mb-4 text-cyan-400 uppercase"
          >
            settings
          </h1>
          <p class="lg:w-2/3 mx-auto leading-relaxed text-base">
            Make a difference
          </p>
        </div>
        <div class="lg:w-1/2 md:w-2/3 mx-auto text-gray-300">
          <div class="flex flex-wrap">
            <div class="p-2 w-full">
              <div class="relative text-left">
                <label class="leading-7 block text-lg">Libraries:</label>
                <ul class="p-2">
                  <li
                    v-for="(lib, index) in libraries"
                    :key="index"
                    class="relative text-cyan-300"
                  >
                    <div class="lib-name break-words">{{ lib }}</div>
                    <div
                      @click="libraries.splice(index, 1)"
                      class="w-8 h-8 flex justify-center items-center absolute top-0 right-0 cursor-pointer"
                    >
                      <svg
                        class="fill-current w-5 h-5 inline-block"
                        viewBox="0 0 24 24"
                      >
                        <path :d="icons.close" />
                      </svg>
                    </div>
                  </li>
                </ul>
                <div
                  class="p-2 italic text-cyan-300"
                  v-show="libraries.length === 0"
                >
                  * no libraries added
                </div>
                <button
                  @click="addLibrary"
                  class="w-full bg-transparent rounded border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-400 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                >
                  add library
                </button>
              </div>
            </div>

            <div class="p-2 mt-10 w-full">
              <button
                @click="save"
                class="flex mx-auto bg-cyan-300 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                save
              </button>
            </div>
            <div
              class="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center"
            >
              <a class="text-indigo-500">example@email.com</a>
              <p class="leading-normal my-5">
                49 Smith St.
                <br />Saint Cloud, MN 56301
              </p>
              <span class="inline-flex">
                <a class="text-gray-500">
                  <svg
                    fill="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    />
                  </svg>
                </a>
                <a class="ml-4 text-gray-500">
                  <svg
                    fill="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                    />
                  </svg>
                </a>
                <a class="ml-4 text-gray-500">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path
                      d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"
                    />
                  </svg>
                </a>
                <a class="ml-4 text-gray-500">
                  <svg
                    fill="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                    />
                  </svg>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { mdiClose } from "@mdi/js";
import { Listener } from "@/components/frontEndUtils";
import { remove } from "lodash";
import { useStore } from "vuex";

const { lifeCycleMixin } = require("@/components/mixins");

export default defineComponent({
  name: "Home",
  mixins: [lifeCycleMixin],
  setup() {
    const store = useStore();
    const localstorageLibs = localStorage.getItem("quest-user-libraries"),
      libraries: string[] = localstorageLibs
        ? reactive([...JSON.parse(localstorageLibs)])
        : reactive([]),
      icons = { close: mdiClose };

    const listener = new Listener();
    listener.register(
      "add new library",
      "add-new-lib",
      (_: any, params: string) => {
        remove(libraries, i => i === params);
        libraries.push(params);
      },
      false
    );

    function addLibrary() {
      listener.emit(-1);
    }
    function save() {
      store.dispatch("changeLibraries", libraries);
    }

    function getListeners() {
      return listener;
    }
    return { libraries, getListeners, addLibrary, save, icons };
  }
});
</script>

<style lang="scss">
.lib-name {
  &:hover {
    & + div {
      opacity: 1;
      transform: translateX(95%) scale(1);
      transition: all 150ms ease;
    }
  }
  & + div {
    transition: all 150ms ease;
    transform: translateX(75%) scale(1);
    opacity: 0;
    &:hover {
      opacity: 1;
      transform: translateX(95%) scale(1.1);
    }
  }
}
</style>
