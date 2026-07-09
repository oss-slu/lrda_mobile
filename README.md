# LRDA Mobile

**Product Owner:** [Adam Park](https://github.com/park353) | Part of the [Where's Religion](https://wheresreligion.org) project, funded by the Henry Luce Foundation and developed through [Open Source with SLU](https://github.com/oss-slu).

## Overview

LRDA Mobile is the mobile app for the Lived Religion Application (LRDA), designed to provide ethnographers with an accessible platform to share their data worldwide. Built using React Native and TypeScript, this app connects to the Rerum Website to facilitate seamless data integration.

## Screenshots

### Onboarding

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9517.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9518.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9519.PNG" width="200">
</div>

### Login Page

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9520.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9522.PNG" width="200">
</div>

### Home Page

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9523.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9524.PNG" width="200">
</div>

### Map Page

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9525.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9531.png" width="200">
  <img src="./assets/demo_photos/IMG_9533.PNG" width="200">

</div>

### More Page

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9528.PNG" width="200">
</div>

### Note Page

<div style="display: flex; justify-content: space-between;">
  <img src="./assets/demo_photos/IMG_9529.PNG" width="200">
  <img src="./assets/demo_photos/IMG_9530.PNG" width="200">
</div>

## Installation

### Prerequisites

Make sure you have Node.js, React Native, and Expo CLI installed on your machine. If you need guidance, please follow the [React Native Getting Started guide](https://reactnative.dev/docs/getting-started).

### Dependency Installation

Once you have the prerequisites installed, you can install the dependencies for the app by running:

```bash
pnpm install
```

### Starting the App

To build and run the app on a simulator, run:

```bash
pnpm ios       # iOS simulator
pnpm android   # Android emulator
```

These commands build the native app, install it on the simulator, and start the Metro bundler. After the first build you can restart just the bundler with `pnpm start`.

## Running via Phone

The app uses native modules (such as react-native-maps) that are not included in the Expo Go app, so it requires a development build. Connect a device and run `pnpm ios --device` / `pnpm android --device`, or install a build produced by EAS (`pnpm build:ios` / `pnpm build:android`).

## Known Bugs

- The app does not compile to the web due to a dependency on react-native-maps.
- Scroller on add note and edit note sometimes do not work on IOS
- The notes orientation on map page for android is off centered.

## License

LRDA Mobile is released under the MIT License.
