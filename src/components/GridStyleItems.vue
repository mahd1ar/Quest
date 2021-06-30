<template>
  <div class="flex flex-wrap">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="p-3"
      @click="$emit('clicked', [item, index])"
    >
      <span
        class="bg-white bg-opacity-5 hover:bg-opacity-10 cursor-pointer flex flex-col rounded-sm w-40"
      >
        <div class="rounded-md m-2 mb-4 overflow-hidden relative h-32">
          <img
            :class="`${name}-cover-${index} ${name}-cover`"
            class="w-full h-full object-cover relative"
            :style="initialStyle"
            :src="item.image"
          />
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
import { defineComponent } from "vue";

export default defineComponent({
  name: "GridStyleItems",
  props: {
    initialStyle: {
      required: false,
      type: String,
      default: null
    },
    items: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      required: true
    }
  },
  setup() {
    return {};
  }
});
</script>

<style lang="scss"></style>
