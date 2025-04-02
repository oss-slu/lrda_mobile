import 'dotenv/config';

export default {
  expo: {
    name: "Where's Religion?",
    slug: "lrda_mobile",
    version: "1.0.7",
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
        googleMapsApiKey: process.env.MAP_API_KEY
      },
      buildNumber: "2",
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
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.MAP_API_KEY
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
      apiKey: "AIzaSyAdPkGTowU6RANDTH2u1z1Zc2w1xrhmKgI",
      authDomain: "lrda-75cf4.firebaseapp.com",
      projectId: "lrda-75cf4",
      storageBucket: "lrda-75cf4.appspot.com",
      messagingSenderId: "840259501846",
      appId: "1:840259501846:web:7bda1da9535d6f746a1a37",
      measurementId:" G-Z4NM1MFGPS",
      apiBaseUrl: "https://lived-religion-dev.rerum.io/deer-lr/",
      s3ProxyPrefix: "http://s3-proxy.rerum.io/S3/",
      eas: {
        "projectId": "801029ef-db83-4668-a97a-5adcc4c333e2"
      }
    }
  }
};
