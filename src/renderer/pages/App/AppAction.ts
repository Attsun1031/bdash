import fs from "fs";
import { ensureDirSync } from "fs-extra";
import Database from "../../../lib/Database";
import { setting } from "../../../lib/Setting";
import Config from "../../../lib/Config";
import { dispatch } from "./AppStore";
import DataSourceAction from "../DataSource/DataSourceAction";

const AppAction = {
  async initialize() {
    if (!fs.existsSync(Config.bdashRoot)) {
      ensureDirSync(Config.bdashRoot);
    }

    const databasePath = Config.databasePath;

    setting.initialize(Config.settingPath);

    await Database.connection.initialize({ databasePath });
    dispatch("initialize");

    // on boarding
    const count = await Database.DataSource.count();
    if (count === 0) {
      dispatch("selectPage", { page: "dataSource" });
      DataSourceAction.showForm();
    }
  },

  selectPage(page) {
    dispatch("selectPage", { page });
  }
};

export default AppAction;
