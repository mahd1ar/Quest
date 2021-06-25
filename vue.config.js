module.exports = {
  lintOnSave: false,
  configureWebpack: {
    devtool: "source-map"
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      contextIsolation: true,
      builderOptions: {
        productName: "Quest",
        appId: "quest.ir",
        win: {
          target: ["nsis"],
          icon: "public/icons/favicon.ico",
          requestedExecutionLevel: "requireAdministrator"
        },
        nsis: {
          installerIcon: "public/icons/favicon.ico",
          uninstallerIcon: "public/icons/favicon.ico",
          uninstallDisplayName: "CPU Monitor",
          license: "license.txt",
          oneClick: false,
          allowToChangeInstallationDirectory: true
        }
      }
    }
  }
};
