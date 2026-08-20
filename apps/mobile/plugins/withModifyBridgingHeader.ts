import fs from "fs";

import {
  type ConfigPlugin,
  BaseMods,
  IOSConfig,
  Mod,
  withMod,
  createRunOncePlugin,
} from "@expo/config-plugins";

type Input = {};

const BRIDGING_HEADER_PATH = "../targets/StatusWidget/assets/StatusWidget-Bridging-Header.h";

// Function to update the bridging header for the StatusWidget target
export const updateBridgingHeader = async (filePath: string) => {
  // Load the Xcode project from the file
  const pbxproj = fs.readFileSync(filePath, "utf-8");

  // Regular expression to find the CODE_SIGN_ENTITLEMENTS line
  const codeSignEntitlementsRegex = /(CODE_SIGN_ENTITLEMENTS = .*StatusWidget[^;]+;)/g;

  // Check if the CODE_SIGN_ENTITLEMENTS line exists
  if (codeSignEntitlementsRegex.test(pbxproj)) {
    // Append the SWIFT_OBJC_BRIDGING_HEADER after CODE_SIGN_ENTITLEMENTS
    const updatedPbxproj = pbxproj.replaceAll(
      codeSignEntitlementsRegex,
      `$1\n\t\t\t\tSWIFT_OBJC_BRIDGING_HEADER = ${BRIDGING_HEADER_PATH};`,
    );

    // Save the modified Xcode project back to the file
    fs.writeFileSync(filePath, updatedPbxproj);
  } else {
    throw new Error("CODE_SIGN_ENTITLEMENTS entry not found in the StatusWidget target.");
  }
};

const withLinkFilesAcrossTargetsBaseModInternal: ConfigPlugin<Input> = (config, _input) => {
  return BaseMods.withGeneratedBaseMods(config, {
    platform: "ios",
    providers: {
      linkFilesAcrossTargets: BaseMods.provider<string>({
        // Get the local filepath that should be passed to the `read` method.
        getFilePath({ _internal }) {
          return IOSConfig.Paths.getPBXProjectPath(_internal!.projectRoot);
        },

        // Read the input file from the filesystem.
        async read(filePath) {
          return filePath;
        },

        // Write the resulting output to the filesystem.
        async write(filePath) {
          // Update the bridging header for the StatusWidget target
          await updateBridgingHeader(filePath);
        },
      }),
    },
  });
};

const withLinkFilesAcrossTargetsBasePlugin: ConfigPlugin = (config) => {
  const plugin: ConfigPlugin<Mod<IOSConfig.Paths.AppDelegateProjectFile>> = (config, action) => {
    return withMod(config, {
      platform: "ios",
      mod: "linkFilesAcrossTargets",
      action,
    });
  };

  return plugin(config, (config) => {
    return config;
  });
};

const withLinkFilesAcrossTargetsBaseMod = createRunOncePlugin(
  withLinkFilesAcrossTargetsBaseModInternal,
  "withLinkFilesAcrossTargetsBaseMod",
);

export const withModifyBridgingHeader: ConfigPlugin<Input> = (config, input) => {
  // Ensure it runs after `expo-apple-targets`
  withLinkFilesAcrossTargetsBasePlugin(config);
  return withLinkFilesAcrossTargetsBaseMod(config, input);
};
