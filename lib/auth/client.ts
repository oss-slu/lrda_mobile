import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  authApiUrl?: string;
};

export const AUTH_API_URL = extra.authApiUrl ?? "";

export const authClient = createAuthClient({
  baseURL: AUTH_API_URL,
  basePath: "/api/auth",
  plugins: [
    expoClient({
      scheme: "lrda",
      storagePrefix: "lrda",
      storage: SecureStore,
    }),
  ],
});
