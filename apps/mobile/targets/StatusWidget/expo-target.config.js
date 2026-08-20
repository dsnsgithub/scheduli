/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  entitlements: {
    "com.apple.security.application-groups": ["group.scheduli"],
  },
  deploymentTarget: "17.0",
  colors: {
    WidgetBackground: "#BFE0E2",
    TextColor: {
      light: "#000000",
      dark: "#DDEFF0",
    },
    DarkBackground: "#1A2C32",
    AccentColor: {
      light: "#92CACE",
      dark: "#356169",
    },
  },
  frameworks: ["SwiftUI"],
};
