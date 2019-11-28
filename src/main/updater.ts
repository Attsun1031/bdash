import { autoUpdater, AppUpdater } from "electron-updater";
import isDev from "electron-is-dev";
import logger from "./logger";

autoUpdater.logger = logger;

const WATCH_INTERVAL = 60 * 60 * 1000; // 1 hour

export enum UpdateState {
  UpdateNotAvailable,
  UpdateDownloaded
}

export class Updater {
  state = UpdateState.UpdateNotAvailable;
  autoUpdater: AppUpdater;

  constructor(autoUpdater: AppUpdater) {
    this.autoUpdater = autoUpdater;
    this.autoUpdater.on("update-downloaded", () => {
      this.state = UpdateState.UpdateDownloaded;
    });
  }

  check() {
    if (isDev) return;
    this.autoUpdater.checkForUpdates();
  }

  watch() {
    this.check();
    setInterval(() => this.check(), WATCH_INTERVAL);
  }

  quit() {
    this.autoUpdater.quitAndInstall();
  }
}

export const updater = new Updater(autoUpdater);
