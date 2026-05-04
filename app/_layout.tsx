import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "../lib/components/ThemeProvider";
import { AddNoteProvider } from "../lib/context/AddNoteContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../lib/stores/authStore";
import { getItem } from "../lib/utils/async_storage";
import Toast from "react-native-toast-message";
import "react-native-gesture-handler";
import { useState } from "react";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const isReady = useAuthStore((s) => s.isReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const checkState = async () => {
      const onboarded = await getItem("onboarded");
      setIsOnboarded(onboarded === "1");
      await initialize();
      await SplashScreen.hideAsync();
    };
    checkState();
  }, []);

  if (!isReady) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isOnboarded && isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-note" />
          <Stack.Screen name="edit-note" />
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
    <ThemeProvider>
      <AddNoteProvider>
        <RootLayoutInner />
      </AddNoteProvider>
    </ThemeProvider>
  );
}
