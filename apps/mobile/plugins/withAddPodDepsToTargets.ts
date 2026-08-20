import fs from "node:fs";
import path from "node:path";

import { withDangerousMod, type ConfigPlugin } from "@expo/config-plugins";
import { mergeContents } from "@expo/config-plugins/build/utils/generateCode";

const SRC_TO_ADD_TO_PODFILE = `
target "StatusWidget" do
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  pod "MMKVAppExtension"
end
`;

export const withAddPodDepsToTargets: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await fs.promises.readFile(file, "utf8");
      await fs.promises.writeFile(file, addPodDepsToTargets(contents), "utf8");
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
