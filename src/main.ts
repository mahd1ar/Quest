import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import deflayout from "@/views/layouts/AppLayoutDefault.vue";
import { keys } from "lodash";
localStorage.setItem(
  "database-path",
  "/home/mahdiyar/.config/quest/musics-db.json"
);

// // Vue.component("nolayout", nolayout);
// const MyDirective = {
//   created(el, binding, vnode, prevVnode) {}, // new
//   beforeMount() {},
//   mounted() {},
//   beforeUpdate() {}, // new
//   updated() {},
//   beforeUnmount() {}, // new
//   unmounted() {}
// }

const observers: Map<number, IntersectionObserver> = new Map();

createApp(App)
  .use(router)
  .use(store)
  .component("deflayout", deflayout)
  .directive("intersection", {
    created(el, binding) {
      if (!binding.value)
        throw new Error(
          "[Custom directive IntersectionObserver] callback function is not provided"
        );

      const callback = (
        entries: IntersectionObserverEntry[],
        currentObserver: IntersectionObserver
      ) => {
        if (entries[0].isIntersecting) {
          binding.value();
          if (binding.arg === "once") {
            currentObserver.disconnect();
            observers.delete(Number((<HTMLElement>el).dataset.intersectionid!));
          }
        }
      };

      const id = Math.floor(Math.random() * 10000);

      (<HTMLElement>el).dataset.intersectionid = String(id);

      observers.set(
        id,
        new IntersectionObserver(callback, {
          root: document.querySelector("#app"),
          threshold: 1.0
        })
      );
    },
    mounted(el) {
      observers
        .get(Number((<HTMLElement>el).dataset.intersectionid!))!
        .observe(el);
    },
    unmounted(el) {
      const targetid = Number((<HTMLElement>el).dataset.intersectionid!);

      if (observers.has(targetid)) observers.get(targetid)!.disconnect();
    }
  })
  .mount("#app");
