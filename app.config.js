import 'dotenv/config';

export default {
  expo: {
    name: "Where's Religion?",
    slug: "lrda_mobile",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "register.edu.slu.cs.oss.lrda",
      config: {
        googleMapsApiKey: process.env.API_KEY
      },
      buildNumber: "12"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.API_KEY
        }
      },
      package: "register.edu.slu.cs.oss.lrda",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    updates: {
      url: "https://u.expo.dev/801029ef-db83-4668-a97a-5adcc4c333e2"
    },
    extra: {
      eas: {
        projectId: "801029ef-db83-4668-a97a-5adcc4c333e2"
      }
    },
  }
};
