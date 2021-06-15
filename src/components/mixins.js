import { ipcRenderer } from "electron";

const lifeCycleMixin = {
  mounted() {
    // console.log('FROM MIXIN')
    // console.log(this.$refs)
    if (this.getListeners)
      this.getListeners()
        .get()
        .forEach((element, index) => {
          if (element.emitOnLoad) {
            this.getListeners().emit(index);
          }
          ipcRenderer.on(element.name + ".res", element.action);
        });
  },
  unmounted() {
    if (this.getListeners)
      this.getListeners()
        .get()
        .forEach(element => {
          ipcRenderer.removeAllListeners(element.name + ".res");
        });
  }
};

export { lifeCycleMixin };
