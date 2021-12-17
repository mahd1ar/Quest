import { createGlobalState, useStorage } from "@vueuse/core";
import { LocalStorage } from "@/schema/Enums";

const initialValue = {
  favorites: [] as string[],
  volume: 50 // localStorage.get LocalStorage.favorites
};
export const useGlobalState = createGlobalState(() =>
  useStorage("local-storage", initialValue)
);
