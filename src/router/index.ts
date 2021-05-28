import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Setting from "../views/Setting.vue";
import Frontend from "@/views/Frontend.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    meta: {
      layout: ""
    },
    component: Home
  },
  {
    path: "/setting",
    name: "setting",
    meta: {
      layout: ""
    },
    component: Setting
  },
  {
    path: "/",
    name: "frontend",
    meta: {
      layout: ""
    },
    component: Frontend
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
