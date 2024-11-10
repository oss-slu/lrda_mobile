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
      buildNumber: "3"
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
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      eas: {
        "projectId": "801029ef-db83-4668-a97a-5adcc4c333e2"
      }
    },
   
  }
};