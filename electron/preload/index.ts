import { ipcRenderer } from "electron";

export const f1mvli = {
  config: {
    set: (key: string, value) => ipcRenderer.invoke("config:set", key, value),
    get: (key: string) => ipcRenderer.invoke("config:get", key),
    getAll: () => ipcRenderer.invoke("config:get:all"),
    resetToDefault: () => ipcRenderer.invoke("config:resetToDefault"),
    delete: (key: string) => ipcRenderer.invoke("config:delete", key),
    openInEditor: () => ipcRenderer.invoke("config:open:inEditor"),
  },
  updater: {
    checkForUpdates: () => ipcRenderer.invoke("updater:checkForUpdates"),
    getUpdateAvailable: () => ipcRenderer.invoke("updater:getUpdateAvailable"),
    getForceDevUpdate: () => ipcRenderer.invoke("updater:getForceDevUpdate"),
  },
  log: {
    openLogFile: () => ipcRenderer.invoke("log:openLogFile"),
    getLogs: () => ipcRenderer.invoke("log:getLogs"),
  },
  utils: {
    getHighestEffectId: () => ipcRenderer.invoke("utils:getHighestEffectId"),
    getStates: () => ipcRenderer.invoke("utils:getStates"),
    getWindowSizes: () => ipcRenderer.invoke("utils:getWindowSizes"),
    openNewWindow: (url) => ipcRenderer.invoke("utils:open-win", url),
    changeWindowTitle : (title: string) => ipcRenderer.invoke("utils:changeWindowTitle", title),
    relaunchApp: () => ipcRenderer.invoke("utils:relaunchApp"),
    exitApp: () => ipcRenderer.invoke("utils:exitApp"),
  },
  integrations: {
    homeAssistant: {
      getDevices: () => ipcRenderer.invoke("integrations:homeAssistant:getDevices"),
      checkDeviceSpectrum: (entityId: string) => ipcRenderer.invoke("integrations:homeAssistant:checkDeviceSpectrum", entityId),
    },
    openRGB: {
      reConnect: () => ipcRenderer.invoke("integrations:openRGB:reConnect"),
    },
    WLED: {
      getDevices: () => ipcRenderer.invoke("integrations:WLED:getDevices"),
    },
    mqtt: {
      reConnect: () => ipcRenderer.invoke("integrations:mqtt:reConnect"),
    },
    hue: {
      getLights: () => ipcRenderer.invoke("integrations:hue:getLights"),
      getEntertainmentZones: () => ipcRenderer.invoke("integrations:hue:getEntertainmentZones"),
      discoverBridge: (discoverMode: "remote" | "local") => ipcRenderer.invoke("integrations:hue:discoverBridge", discoverMode),
      connectToBridge: () => ipcRenderer.invoke("integrations:hue:connectToBridge"),
    },
    ikea: {
      searchAndConnectToGateway: () => ipcRenderer.invoke("integrations:ikea:searchAndConnectToGateway"),
      getDevices: () => ipcRenderer.invoke("integrations:ikea:getDevices"),
    },
  }
};

// @ts-ignore
window.f1mvli = f1mvli;