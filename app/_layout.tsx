import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "../redux/store/store";
import { PersistGate } from "redux-persist/lib/integration/react";
import { ThemeProvider } from "../lib/components/ThemeProvider";
import { AddNoteProvider } from "../lib/context/AddNoteContext";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { User } from "../lib/models/user_class";
import { getItem } from "../lib/utils/async_storage";
import Toast from "react-native-toast-message";
import "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const user = User.getInstance();

function RootLayoutInner() {
  const [isReady, setIsReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkState = async () => {
      const onboarded = await getItem("onboarded");
      const isValid = await user.initializeUser();
      setIsOnboarded(onboarded === "1");
      setIsAuthenticated(isValid);
      setIsReady(true);
      await SplashScreen.hideAsync();
    };
    checkState();
  }, []);

  useEffect(() => {
    user.setLoginCallback((isLoggedIn: boolean) => {
      setIsAuthenticated(isLoggedIn);
    });
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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AddNoteProvider>
            <RootLayoutInner />
          </AddNoteProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
