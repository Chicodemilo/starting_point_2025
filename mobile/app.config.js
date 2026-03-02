// ==============================================================================
// File:      mobile/app.config.js
// Purpose:   Expo app configuration. Derives app name and slug from the
//            EXPO_PUBLIC_APP_NAME environment variable and sets platform-
//            specific icons, splash screens, and plugins.
// Callers:   Expo CLI (build/start entry point)
// Callees:   expo-router (plugin)
// Modified:  2026-03-01
// ==============================================================================

const appName = process.env.EXPO_PUBLIC_APP_NAME || "My App";
const slug = appName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default {
  expo: {
    name: appName,
    slug: slug,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: slug,
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
  },
};
