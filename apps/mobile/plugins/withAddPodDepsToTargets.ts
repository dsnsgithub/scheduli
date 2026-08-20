import fs from "node:fs";
import path from "node:path";

import { withDangerousMod, type ConfigPlugin } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

const SRC_TO_ADD_TO_PODFILE = `
target "StatusWidget" do
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  pod "MMKVAppExtension", "2.4.0"
  pod "MMKVCore", "2.4.0"
end
`;

const PINNED_PODS = `
  pod "PostHog", "3.69.8"
`;

export const withAddPodDepsToTargets: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await fs.promises.readFile(file, "utf8");
      await fs.promises.writeFile(file, pinPods(addPodDepsToTargets(contents)), "utf8");
      return config;
    },
  ]);
};

function addPodDepsToTargets(src: string) {
  return mergeContents({
    tag: `with-add-pod-deps-to-targets`,
    src,
    newSrc: SRC_TO_ADD_TO_PODFILE.trim(),
    anchor: /target ['"]([^'"]*)['"] do/,
    offset: 0,
    comment: "#",
  }).contents;
}

function pinPods(src: string) {
  const result = mergeContents({
    tag: `with-pinned-pods`,
    src,
    newSrc: PINNED_PODS.replace(/\n$/, ""),
    anchor: /use_expo_modules!/,
    offset: 1,
    comment: "#",
  });

  if (!result.didMerge) {
    throw new Error(
      "withAddPodDepsToTargets: could not find `use_expo_modules!` in the Podfile, so pinned pods were not applied.",
    );
  }

  return result.contents;
}
