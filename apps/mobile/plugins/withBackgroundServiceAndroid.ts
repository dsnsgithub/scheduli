import { withAndroidManifest, type ConfigPlugin } from "@expo/config-plugins";

export const withBackgroundServiceAndroid: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    if (androidManifest && androidManifest.manifest) {
      // Add xmlns:tools to the <manifest> tag if not present
      if (!androidManifest.manifest.$["xmlns:tools"]) {
        androidManifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
      }

      // Define the permissions to be added
      const requiredPermissions = [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
      ];

      // Ensure the <uses-permission> elements are present
      if (!androidManifest.manifest["uses-permission"]) {
        androidManifest.manifest["uses-permission"] = [];
      }

      // Add permissions if not already present
      requiredPermissions.forEach((permission) => {
        const existingPermission = androidManifest.manifest["uses-permission"].some(
          (item) => item.$["android:name"] === permission,
        );

        if (!existingPermission) {
          androidManifest.manifest["uses-permission"].push({
            $: { "android:name": permission },
          });
        }
      });

      // Ensure the <application> tag exists
      const application = androidManifest.manifest.application || [];

      // Define the service object to be added
      const serviceTag = {
        $: {
          "android:name": "app.notifee.core.ForegroundService",
          "android:foregroundServiceType": "specialUse",
          "tools:replace": "android:foregroundServiceType",
        },
        property: [
          {
            $: {
              "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
              "android:value": "Allows for a countdown progress notification",
            },
          },
        ],
      };

      // Check if the service already exists, if not, add it
      const existingService = application[0]?.service?.some(
        (service) => service.$["android:name"] === "app.notifee.core.ForegroundService",
      );

      if (!existingService) {
        if (!application[0].service) {
          application[0].service = [];
        }
        application[0].service.push(serviceTag);
      }

      // Set the modified application back in the manifest
      androidManifest.manifest.application = application;
    }

    return config;
  });
};
