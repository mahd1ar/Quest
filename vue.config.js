// const { argv } = require("yargs");
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
          requestedExecutionLevel: "asInvoker"
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
  // run this later
  //   chainWebpack: config => {
  //     config.plugin("define").tap(options => {
  //         options[0]["process.env"].PARAMETER = `"${argv.parameter}"`;
  //         return options;
  //     })
  //  }
};
