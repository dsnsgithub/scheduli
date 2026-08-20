import { withProjectBuildGradle, type ConfigPlugin } from "@expo/config-plugins";

// https://github.com/invertase/notifee/issues/1284
// maven.notifee.app is offline, so resolve app.notifee exclusively from
// the local .aar bundled in node_modules to avoid JitPack timeouts.
const notifeeExclusiveContent = `
allprojects {
    repositories {
        exclusiveContent {
            filter {
                includeGroup "app.notifee"
            }
            forRepository {
                maven {
                    url "$rootDir/../../../node_modules/@notifee/react-native/android/libs"
                }
            }
        }
    }
}
`;

export const withNotifeeAndroidWorkaround: ConfigPlugin = (config) => {
  return withProjectBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes('includeGroup "app.notifee"')) {
      config.modResults.contents = buildGradle + notifeeExclusiveContent;
    }

    return config;
  });
};
