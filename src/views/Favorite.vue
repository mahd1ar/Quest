<template>
  <main class="bg-gray-800 text-center text-red-100 w-full overflow-y-scroll">
    favorite page
    <!-- GAP -->
    <div class="h-24"></div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
const { lifeCycleMixin } = require("@/components/mixins");

export default defineComponent({
  name: "Home",
  mixins: [lifeCycleMixin],
  setup() {
    return {};
  }
});
</script>

<style lang="scss"></style>
