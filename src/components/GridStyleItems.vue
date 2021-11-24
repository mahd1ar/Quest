<template>
  <div class="flex flex-wrap">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="p-3"
      :style="`--delay: ${index * 100}ms ;`"
      @click="$emit('clicked', [item, index])"
    >
      <span
        class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm w-40"
      >
        <div
          class="rounded-md m-2 mb-4 overflow-hidden relative h-32 hoverable"
        >
          <img
            :class="`${name}-cover-${index} ${name}-cover`"
            class="w-full h-full object-cover relative"
            :src="item.img"
          />
          <!-- :style="initialStyle" -->
          <div
            v-if="batchAction"
            @click.stop="$emit('on-select', [item, index])"
            class="absolute overflow-hidden bg-black text-white bottom-1 right-1 rounded-full"
          >
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="inline cursor-pointer p-1 rounded-full h-full"
            >
              <path :d="icons.play" />
            </svg>
            <span class="capitalize tracking-wider">play</span>
          </div>
        </div>
        <span class="capitalize px-2 font-bold text-blue-100">
          <h3
            class="text-lg text-blue-50 whitespace-nowrap overflow-ellipsis w-full overflow-x-hidden"
          >
            {{ item.name }}
          </h3>
          <div
            v-if="item.description"
            class="text-sm my-2 text-gray-400 overflow-hidden h-11 overflow-ellipsis font-roboto"
          >
            {{ item.description }}
          </div>
          <div v-else class="h-11"></div>
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { mdiPlay } from "@mdi/js";
import { Music } from "@/schema";

export default defineComponent({
  name: "GridStyleItems",
  props: {
    initialStyle: {
      required: false,
      type: String,
      default: null
    },
    batchAction: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array as PropType<Music[] | { img: string; name: string }[]>,
      default: () => []
    },
    name: {
      type: String,
      required: true
    }
  },
  setup() {
    const icons = {
      play: mdiPlay
    };

    //       const  isBatch= ref<boolean>(false)
    // if(p.items.length>0)

    return { icons };
  }
});
</script>

<style lang="scss" scoped>
.hoverable {
  div.absolute {
    transform: scale(0);
    transition: all 200ms ease;
    width: 35px;
    height: 35px;
  }
  &:hover {
    div.absolute {
      transform: scale(1.1);
      transition-delay: 100ms;

      &:hover {
        width: 75px;
        transform: scale(1);
      }
    }
  }
}
</style>
