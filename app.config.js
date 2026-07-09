import "dotenv/config";
import { networkInterfaces } from "os";

function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

const AUTH_API_URL = process.env.AUTH_API_URL?.replace("localhost", getLocalIP());

export default {
  expo: {
    name: "Where's Religion?",
    slug: "lrda_mobile",
    scheme: "lrda",
    version: "1.0.8",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "register.edu.slu.cs.oss.lrda",
      config: {
        googleMapsApiKey: "",
      },
      buildNumber: "1",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        NSLocationWhenInUseUsageDescription:
          "Allowing location services enables you to see nearby notes and/or share the location of your notes with other app users.",
        NSLocationAlwaysUsageDescription:
          "Allowing location services enables you to see nearby notes and/or share the location of your notes with other app users.",
        NSCameraUsageDescription: "Allowing camera access enables you to upload and/or share your photos or videos with other app users. ",
        NSMicrophoneUsageDescription:
          "Allowing microphone access enables you to take, upload, and/or share audio recordings with other app users.",
        NSPhotoLibraryUsageDescription:
          "Allowing access to photo library enables you to select, upload, and/or share your chosen photos or videos with other app users. ",
        NSPhotoLibraryAddUsageDescription:
          "Allowing access to photo library enables you to select, upload, and/or share your chosen photos or videos with other app users. ",
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: "",
        },
      },
      package: "register.edu.slu.cs.oss.lrda",
      versionCode: 28,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    updates: {
      url: "https://u.expo.dev/801029ef-db83-4668-a97a-5adcc4c333e2",
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL?.replace("localhost", getLocalIP()),
      authApiUrl: AUTH_API_URL,
      s3ProxyPrefix: process.env.S3_PROXY_PREFIX,
      eas: {
        projectId: "801029ef-db83-4668-a97a-5adcc4c333e2",
      },
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 25,
          },
        },
      ],
      "expo-font",
      "expo-router",
      "expo-secure-store",
      "expo-splash-screen",
      "expo-status-bar",
      "expo-audio",
      "expo-video",
    ],
  },
};
