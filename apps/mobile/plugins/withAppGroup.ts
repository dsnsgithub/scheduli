import { withInfoPlist, type ConfigPlugin } from "@expo/config-plugins";

// Define the App Group name
const APP_GROUP_NAME = "group.scheduli";

// Create the config plugin
export const withAppGroup: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    // Ensure the Info.plist has the AppGroup key and set it to the desired value
    config.modResults.AppGroup = APP_GROUP_NAME;
    return config;
  });
};
