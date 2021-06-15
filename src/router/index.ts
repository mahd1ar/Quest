import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Setting from "../views/Setting.vue";
import Category from "@/views/Category.vue";
import Favorite from "@/views/Favorite.vue";

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
    name: "category",
    meta: {
      layout: ""
    },
    component: Category
  },
  {
    path: "/favorite",
    name: "favorite",
    meta: {
      layout: ""
    },
    component: Favorite
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
