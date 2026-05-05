import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as {
    authApiUrl?: string;
};

export const AUTH_API_URL = extra.authApiUrl ?? "";

type AuthFetchOptions = RequestInit & {
    skipAuth?: boolean;
};

export async function authFetch(path: string, options: AuthFetchOptions = {}) {
    const { skipAuth = false, headers, ...rest } = options;
    const token = await AsyncStorage.getItem("authToken");

    const mergedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Origin: AUTH_API_URL,
        ...(headers as Record<string, string> | undefined),
    };

    if (!skipAuth) {
        if (token && token.trim().length > 0) {
            mergedHeaders.Authorization = `Bearer ${token}`;
            console.log(`[authFetch] ${path}: Adding Bearer token (length: ${token.length})`);
        } else {
            console.warn(`[authFetch] ${path}: NO TOKEN FOUND in AsyncStorage! User may not be authenticated. skipAuth=${skipAuth}`);
        }
    } else {
        console.log(`[authFetch] ${path}: Skipping auth (unauthenticated endpoint)`);
    }

    const baseUrl = AUTH_API_URL.replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    return fetch(`${baseUrl}${normalizedPath}`, {
        ...rest,
        headers: mergedHeaders,
    });
}
