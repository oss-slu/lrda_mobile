import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query/queryClient";
import { ThemeProvider } from "../lib/components/ThemeProvider";
import { AddNoteProvider } from "../lib/context/AddNoteContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../lib/stores/authStore";
import { useOnboardingStore } from "../lib/stores/onboardingStore";
import Toast from "react-native-toast-message";
import "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const onboardingReady = useOnboardingStore((s) => s.isReady);
  const initOnboarding = useOnboardingStore((s) => s.initialize);
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const checkState = async () => {
      await initOnboarding();
      await initialize();
      await SplashScreen.hideAsync();
    };
    checkState();
  }, [initOnboarding, initialize]);

  if (!isReady || !onboardingReady) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isOnboarded && isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="account" />
          <Stack.Screen name="video-player" />
        </Stack.Protected>

        <Stack.Protected guard={isOnboarded && !isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
      <Toast position="bottom" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AddNoteProvider>
          <RootLayoutInner />
        </AddNoteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
