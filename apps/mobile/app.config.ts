import "tsx/cjs";
import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  experiments: {
    typedRoutes: true,
  },
  icon: "./assets/icon.png",
  scheme: "acme",
  web: {
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    [
      "react-native-android-widget",
      {
        widgets: [
          {
            name: "StatusWidget",
            label: "Scheduli Status Widget",
            minWidth: "250dp",
            minHeight: "100dp",
            description: "View your schedule at a glance.",
            previewImage: "./assets/widget-preview/StatusWidget.png",
            updatePeriodMillis: 1800000,
          },
          {
            name: "ScheduleWidget",
            label: "Scheduli Schedule Widget",
            minWidth: "250dp",
            minHeight: "100dp",
            description: "View your schedule at a glance.",
            previewImage: "./assets/widget-preview/ScheduleWidget.png",
            updatePeriodMillis: 1800000,
          },
        ],
      },
    ],
    [
      "@bacons/apple-targets",
      {
        appleTeamId: "TVP6VU556T",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ddeff0",
        image: "./assets/icon.png",
        imageWidth: 200,
      },
    ],
    "expo-localization",
    "@rnrepo/expo-config-plugin",
    require("./plugins/withNotifeeAndroidWorkaround.ts").withNotifeeAndroidWorkaround,
    require("./plugins/withModifyBridgingHeader.ts").withModifyBridgingHeader,
    require("./plugins/withAppGroup.ts").withAppGroup,
    require("./plugins/withBackgroundServiceAndroid.ts").withBackgroundServiceAndroid,
    require("./plugins/withAddPodDepsToTargets.ts").withAddPodDepsToTargets,
    require("./plugins/withNotificationIcons.ts").withNotificationIcons,
  ],
  name: "Scheduli",
  slug: "Scheduli",
  android: {
    package: "com.scheduli.schedulimobile",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ddeff0",
    },
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "6900fa47-991b-4b32-8105-2d8154b28f03",
    },
  },
  ios: {
    icon: "./assets/Scheduli.icon",
    entitlements: {
      "com.apple.security.application-groups": ["group.scheduli"],
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    bundleIdentifier: "com.scheduli.schedulimobile",
    supportsTablet: true,
  },
};

export default config;
