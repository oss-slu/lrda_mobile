const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force @firebase/* packages to resolve as ESM to prevent dual-package hazard
// where CJS and ESM copies of @firebase/app load with separate internal state.
// See: https://github.com/expo/expo/issues/36598
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleImport, platform) => {
  if (moduleImport.startsWith("@firebase/")) {
    return context.resolveRequest(
      { ...context, isESMImport: true },
      moduleImport,
      platform
    );
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleImport, platform);
  }
  return context.resolveRequest(context, moduleImport, platform);
};

module.exports = config;
