<template>
  <div
    v-if="!show"
    id="veil"
    class="bg-gray-900 flex justify-center items-center w-screen h-screen inset-0 text-center text-blue-100 z-50 text-7xl"
  >
    <div
      class="overlay absolute w-full h-full"
      :class="{ 'bg-black': fadeToDark }"
    ></div>
    Quest {{ emoji }}
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { emitter } from "./frontEndUtils";

export default defineComponent({
  name: "Veil",
  emits: ["update:show"],
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  setup(_, ctx) {
    const fadeToDark = ref(false);
    const e = ["👽", "⚔", "🍕", "🤖", "👾", "😇"].sort(
      () => Math.random() - Math.random()
    )[0];
    const emoji = ref(e);

    onMounted(() => {
      emitter.on("veilDark", e => {
        fadeToDark.value = e;
      });

      emitter.on("veilup", e => {
        ctx.emit("update:show", e);
      });

      // setTimeout(() => {}, 4000);
    });

    return { fadeToDark, emoji };
  }
});
</script>

<style lang="scss" scoped>
#veil {
  .overlay {
    transition: all 800ms ease-out;
  }
}
</style>
