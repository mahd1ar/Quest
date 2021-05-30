import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Setting from "../views/Setting.vue";
import Category from "@/views/Category.vue";

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
    path: "/category/:category/:tag",
    name: "frontend",
    meta: {
      layout: ""
    },
    component: Category
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
