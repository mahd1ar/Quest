import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Setting from "../views/Setting.vue";
import Category from "@/views/Category.vue";
import Favorite from "@/views/Favorite.vue";
import Visualizer from "@/components/Visualizer.vue";
import { emitter } from "@/components/frontEndUtils";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    meta: {
      layout: "",
      keepAlive: true
    },
    component: Home
  },
  {
    path: "/setting",
    name: "setting",
    meta: {
      layout: "",
      keepAlive: true
    },
    component: Setting
  },
  {
    path: "/category/:categoryType/:categoryName",
    name: "category",
    meta: {
      layout: "",
      keepAlive: false
    },
    component: Category,
    props: true
  },
  {
    path: "/favorite",
    name: "favorite",
    meta: {
      layout: "",
      keepAlive: false
    },
    component: Favorite
  },
  {
    path: "/visualizer",
    name: "visualizer",
    meta: {
      layout: "nolayout",
      // layout: "",
      keepAlive: false
    },
    component: Visualizer
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
