module.exports = {
  lintOnSave: false,
  configureWebpack: {
    devtool: "source-map"
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: true
    }
  }
};
