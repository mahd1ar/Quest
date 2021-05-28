<template>
  <div>
    <button @click="addlib">Add Lib</button>
    <!-- <button @click="removeLib">remove lib</button> -->
    <br /><br />
    <div v-for="lib in libs" :key="lib">
      {{ lib }}
    </div>
  </div>
</template>

<script>
// import { reactive, onMounted } from "vue";
// import { useStore } from "vuex";
// import { ipcRenderer } from "electron";
// import _ from "lodash";

export default {
  setup() {}
};
</script>

<style></style>
