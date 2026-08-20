import fs from "fs";
import path from "path";

import { withDangerousMod, type ConfigPlugin } from "@expo/config-plugins";

// Define the source folder where your icons are located
const iconSourceFolder = path.resolve(__dirname, "../assets/android/icons");

// List of drawable folders
const drawableFolders = [
  "drawable-mdpi",
  "drawable-hdpi",
  "drawable-xhdpi",
  "drawable-xxhdpi",
  "drawable-xxxhdpi",
];

export const withNotificationIcons: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const folderPath = path.join(config.modRequest.platformProjectRoot, "app/src/main/res/");

      // Iterate through each drawable folder
      for (const drawable of drawableFolders) {
        const sourceDrawablePath = path.join(iconSourceFolder, drawable);
        const destinationDrawablePath = path.join(folderPath, drawable);

        // Create the destination drawable directory if it doesn't exist
        if (!fs.existsSync(destinationDrawablePath)) {
          fs.mkdirSync(destinationDrawablePath, { recursive: true });
        }

        // Check if the source directory exists
        if (fs.existsSync(sourceDrawablePath)) {
          // Copy each file from the source drawable directory to the destination
          fs.readdirSync(sourceDrawablePath).forEach((file) => {
            const sourceFilePath = path.join(sourceDrawablePath, file);
            const destinationFilePath = path.join(destinationDrawablePath, file);
            fs.copyFileSync(sourceFilePath, destinationFilePath);
          });
        } else {
          console.warn(`Source drawable directory does not exist: ${sourceDrawablePath}`);
        }
      }

      return config;
    },
  ]);
};
