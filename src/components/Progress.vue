<template>
  <div class="relative w-full">
    <div class="h-1 bg-white bg-opacity-30 w-full absolute top-0"></div>
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

<style lang="scss" scoped>
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}
input[type="range"]:focus {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  background: #0000;
  border-radius: 25px;
  border: 0px solid #000101;
}
input[type="range"]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000, 0px 0px 0px #0d0d0d;
  border: 0px solid #000000;
  margin-top: -2px;
  cursor: pointer;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
  /* -webkit-appearance: none; */
}
</style>
