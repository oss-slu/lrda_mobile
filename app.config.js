import 'dotenv/config';

export default {
  expo: {
    name: "Where's Religion?",
    slug: "lrda_mobile",
    version: "1.0.8",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true, // Enable New Architecture for iOS
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
        googleMapsApiKey: ""
      },
      buildNumber: "1",
      newArchEnabled: true, // Enable New Architecture for iOS
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            "s3-proxy.rerum.io": {
              NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
              NSTemporaryExceptionMinimumTLSVersion: "TLSv1.2",
              NSIncludesSubdomains: true,
            }
          }
        },
        // Add these permission descriptions
        NSLocationWhenInUseUsageDescription: "Allowing location services enables you to see nearby notes and/or share the location of your notes with other app users.",
        NSLocationAlwaysUsageDescription: "Allowing location services enables you to see nearby notes and/or share the location of your notes with other app users.",
        NSCameraUsageDescription: "Allowing camera access enables you to upload and/or share your photos or videos with other app users. ",
        NSMicrophoneUsageDescription: "Allowing microphone access enables you to take, upload, and/or share audio recordings with other app users.",
        NSPhotoLibraryUsageDescription: "Allowing access to photo library enables you to select, upload, and/or share your chosen photos or videos with other app users. ",
        NSPhotoLibraryAddUsageDescription: "Allowing access to photo library enables you to select, upload, and/or share your chosen photos or videos with other app users. ",
      }
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: ""
        }
      },
      package: "register.edu.slu.cs.oss.lrda",
      versionCode: 24,
      newArchEnabled: true // Enable New Architecture for Android
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
      measurementId: process.env.MEASUREMENT_ID,
      apiBaseUrl: process.env.API_BASE_URL,
      s3ProxyPrefix: process.env.S3_PROXY_PREFIX,
      eas: {
        "projectId": "801029ef-db83-4668-a97a-5adcc4c333e2"
      }
    }
  }
};
