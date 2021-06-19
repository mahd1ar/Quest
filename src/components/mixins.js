import { ipcRenderer } from "electron";

const lifeCycleMixin = {
  mounted() {
    if (this.getListeners) {
      this.getListeners()
        .get()
        .forEach((element, index) => {
          if (element.emitOnLoad) {
            this.getListeners().emit(index);
          }
          ipcRenderer.on(element.endpoint + ".res", element.action);
        });

      ipcRenderer.on("DB-Changed.res", () => {
        this.$store.dispatch("alert", {
          title: "re scanning library",
          type: "refresh"
        });

        this.getListeners()
          .get()
          .forEach(({ name }) => {
            this.getListeners().emit(name);
          });
      });
    }
  },
  unmounted() {
    if (this.getListeners) {
      this.getListeners()
        .get()
        .forEach(element => {
          ipcRenderer.removeAllListeners(element.endpoint + ".res");
        });

      ipcRenderer.removeAllListeners("DB-Changed.res");
    }
  }
};

export { lifeCycleMixin };
