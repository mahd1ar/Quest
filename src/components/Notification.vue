<template>
  <div class="fixed top-10 right-7 z-10">
    <transition-group name="list-complete" tag="p">
      <div
        v-for="(item, index) in notifications"
        :key="item.id"
        class="list-complete-item relative overflow-x-hidden"
      >
        <div
          class="w-72 relative relative flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-sm border bg-opacity-25"
          :class="colors[index]"
          style="backdrop-filter: blur(20px)"
        >
          <div class="pr-4">
            <svg
              width="100%"
              height="100%"
              fill="#fff"
              viewBox="0 0 24 24"
              stroke
              class="feather feather-check-circle w-5 h-5 mx-2"
            >
              <path v-if="item.type == 'warn'" :d="icons.warn" />
              <path v-if="item.type == 'log'" :d="icons.log" />
              <path v-if="item.type == 'success'" :d="icons.success" />
              <path v-if="item.type == 'error'" :d="icons.error" />
              <path
                v-if="item.type == 'refresh'"
                :d="icons.refresh"
                class="animate-spin origin-center"
              />
            </svg>
          </div>
          <div
            class="text-xl font-normal max-w-full flex-initial overflow-hidden"
          >
            <div class="py-2">
              {{ item.title }}
              <div v-if="item.body" class="text-sm font-base">
                {{ item.body }}
                <a href="/#"></a>
              </div>
            </div>
          </div>
          <div class="flex flex-auto flex-row-reverse">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="feather feather-x cursor-pointer hover:text-green-400 rounded-full w-5 h-5 ml-2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { Notification } from "@/schema";
import { useStore } from "vuex";
import {
  mdiAlert,
  mdiAlertOctagonOutline,
  mdiAlertBoxOutline,
  mdiCheckboxMarkedOutline,
  mdiRefresh
} from "@mdi/js";

export default defineComponent({
  name: "Notification",
  setup() {
    // const store = useStore();
    const notifications = computed(
      // () => store.getters.notifications as Notification[]
      () => [] as Notification[]
    );

    return {
      notifications,
      // colors: computed(() => {
      //   return notifications.value.map(i => {
      //     switch (i.type) {
      //       case "error":
      //         return "text-red-100 bg-red-700 border-red-700";
      //       case "success":
      //         return "text-green-100 bg-green-700 border-green-700";
      //       case "warn":
      //         return "text-yellow-100 bg-yellow-500 border-yellow-700";
      //       case "refresh":
      //         return "text-gray-100 bg-gray-700 border-gray-700";
      //       default:
      //         return "text-gray-100 bg-gray-700 border-gray-700";
      //     }
      //   });
      // }),
      icons: {
        warn: mdiAlert,
        success: mdiCheckboxMarkedOutline,
        log: mdiAlertBoxOutline,
        refresh: mdiRefresh,
        error: mdiAlertOctagonOutline
      }
    };
  }
});
</script>

<style lang="scss">
.list-complete {
  &-item {
    transition: all 0.8s ease;
    opacity: 1;
    max-width: 100%;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    // transform: translateX(-10%);
    max-width: 0%;
  }

  &-leave-active {
    position: relative;
    // &:after {
    //   content: " ";
    //   position: absolute;
    //   inset: 0;
    //   z-index: 20;
    //   background: red;
    //   width: 100%;
    //   height: 100%;
    // }
  }
}
</style>
