import PostHog from "posthog-react-native";

export const posthog = new PostHog("phc_E1JEQrfw74bnKHJkmPbFwlX4QlJPgo12O7qlbfxxzT1", {
  enableSessionReplay: true,
  errorTracking: {
    autocapture: {
      uncaughtExceptions: true,
      unhandledRejections: true,
      console: ["error", "warn"],
    },
  },
  sessionReplayConfig: {
    maskAllTextInputs: false,
    maskAllImages: false,
    maskAllSandboxedViews: false,
    captureLog: true,
    captureNetworkTelemetry: true,
    throttleDelayMs: 100,
  },
  host: "https://us.i.posthog.com",
});
