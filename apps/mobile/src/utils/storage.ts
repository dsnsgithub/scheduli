import { MMKV, Mode } from "react-native-mmkv";

import WidgetUpdaterModule from "@/modules/widget-updater/src/WidgetUpdaterModule";

class EnhancedStorage {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKV({
      id: "mmkv.default",
      mode: Mode.MULTI_PROCESS,
    });
  }

  set = (key: string, value: string) => {
    this.storage.set(key, value);
    WidgetUpdaterModule.update();
  };

  getString = (key: string) => {
    return this.storage.getString(key);
  };

  addOnValueChangedListener = (listener: (key: string) => void) => {
    return this.storage.addOnValueChangedListener(listener);
  };
}

const storage = new EnhancedStorage();

export default storage;
