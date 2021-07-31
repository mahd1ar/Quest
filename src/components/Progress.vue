<template>
  <div class="mx-2 relative w-full">
    <div class="h-1 bg-white w-full absolute top-0"></div>
    <div
      class="h-1 bg-gradient-to-r absolute"
      :class="'from-' + twfrom + ' to-' + twto"
      :style="{ width: seek + '%' }"
    ></div>
    <!-- :class="['from-green-400 to-blue-500','from-purple-400 via-pink-500 to-red-500'][rand(2)]" -->
    <input
      v-model="seek"
      type="range"
      :min="min"
      :max="max"
      class="w-full absolute top-0 h-1 ring-cyan-300"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "Progress",
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    twfrom: {
      type: String,
      default: "green-400"
    },
    twto: {
      type: String,
      default: "blue-500"
    }
  },
  emits: ["update:percentage"],
  setup(props, ctx) {
    console.log(typeof props.percentage);
    const seek = computed({
      get() {
        return props.percentage;
      },
      set(newValue) {
        ctx.emit("update:percentage", Number(newValue));
      }
    });
    return { seek };
  }
});
</script>

<style lang="scss" scoped></style>
