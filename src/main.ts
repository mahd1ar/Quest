import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import deflayout from "@/views/layouts/AppLayoutDefault.vue";
localStorage.setItem(
  "database-path",
  "/home/mahdiyar/.config/quest/musics-db.json"
);

// Vue.component("nolayout", nolayout);

createApp(App)
  .use(router)
  .use(store)
  .component("deflayout", deflayout)
  .mount("#app");
