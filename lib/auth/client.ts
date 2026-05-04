import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  authApiUrl?: string;
};

export const AUTH_API_URL = extra.authApiUrl ?? "";

export const authClient = createAuthClient({
  baseURL: AUTH_API_URL,
  basePath: "/api/auth",
});

export async function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email, password });
}

export async function signUpWithEmail(data: { email: string; password: string; name: string }) {
  return authClient.signUp.email(data);
}

export async function getCurrentSession() {
  return authClient.getSession();
}

export async function signOut() {
  return authClient.signOut();
}
