import 'dotenv/config';

export default {
  expo: {
    name: "Where's Religion?",
    slug: "lrda_mobile",
    version: "1.0.4",
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
        googleMapsApiKey: process.env.MAP_API_KEY
      },
      buildNumber: "5"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.MAP_API_KEY
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
      "url": "https://u.expo.dev/801029ef-db83-4668-a97a-5adcc4c333e2"
    },
    crashReporter: true, // Add this line to enable crash reporting
    extra: {
      MAPS_API_KEY: process.env.FIREBASE_API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID,
      MEASUREMENT_ID: process.env.MEASUREMENT_ID,
      API_BASE_URL: process.env.API_BASE_URL, // Added to pass API_BASE_URL
      MEASUREMENT_ID:process.env.MEASUREMENT_ID,
      S3_PROXY_PREFIX:process.env.S3_PROXY_PREFIX,
      eas: {
        "projectId": "801029ef-db83-4668-a97a-5adcc4c333e2"
      }
    },
   
  }
};