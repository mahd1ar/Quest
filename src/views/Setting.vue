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
                class="flex mx-auto bg-transparent border border-cyan-300 text-cyan-300 py-2 px-8 focus:outline-none rounded text-lg"
              >
                save
              </button>
            </div>
            <div
              class="p-2 w-full pt-1 mt-8 border-t border-gray-200 text-center"
            >
              <p class="leading-normal my-5">
                you can contribute to Quest on Github.
              </p>
              <span class="inline-flex">
                <a
                  class="ml-4 text-gray-500 cursor-pointer"
                  @click="open(`https://github.com/mahd1ar/quest`)"
                >
                  <svg
                    fill="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path :d="icons.github" />
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
import { defineComponent, Ref } from "vue";
import { mdiClose, mdiGithub } from "@mdi/js";
import { remove } from "lodash";
import { useStore } from "vuex";
import { useStorage } from "@vueuse/core";
import { Storage } from "@/providers/constants";
import { shell } from "electron";
import { useIpcRenderer } from "@vueuse/electron";

export default defineComponent({
  name: "Home",
  setup() {
    const store = useStore(),
      ipcRenderer = useIpcRenderer(),
      icons = { close: mdiClose, github: mdiGithub };

    const libraries: Ref<string[]> = useStorage(Storage.Libraries, []);

    const open = (url: string) => {
      shell.openExternal(url);
    };

    ipcRenderer.on("add-new-lib.res", (_: any, params: string) => {
      remove(libraries.value, i => i === params);
      libraries.value.push(params);
    });

    const save = () => {
      // store.dispatch("alert", {
      //   title: "be khodemoon naft bedid",
      //   body: "lorem ipsom some sorie cheghadr kharg kha",
      //   type: "warn"
      // });
      store.dispatch("changeLibraries", libraries.value);
    };

    const addLibrary = () => {
      ipcRenderer.send("add-new-lib.req");
    };

    return { open, libraries, save, icons, addLibrary };
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
