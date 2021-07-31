<template>
  <div class="flex h-full overflow-hidden relative" id="default-layout">
    <slot />
  </div>
</template>

<script>
import { mdiHeart, mdiCog } from "@mdi/js";
export default {
  name: "AppLayoutNone",
  setup() {
    return {
      icons: { like: mdiHeart, settings: mdiCog }
    };
  }
};
</script>

<style lang="scss"></style>
