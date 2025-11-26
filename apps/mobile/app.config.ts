import type { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Meet Riders Mobile",
  slug: "meet-riders-mobile",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false
  },
  android: {},
  web: {},
  extra: {
    eas: {
      projectId: "00000000-0000-0000-0000-000000000000"
    }
  }
});
