import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, ImageBackground, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstClick, setFirstClick] = useState(true);
  const [snackState, toggleSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [snackMessage, setSnackMessage] = useState("");

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setFirstClick(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fadeOut();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      await SplashScreen.hideAsync();
    })();
  }, []);

  const handleGoRegister = () => {
    router.push("/(auth)/register");
  };

  const onDismissSnackBar = () => toggleSnack(false);

  const handleLogin = async () => {
    if (username === "" || password === "") {
      toggleSnack(!snackState);
    } else {
      try {
        await login(username, password);
        setUsername("");
        setPassword("");
        router.replace("/(tabs)");
      } catch (error) {
        console.log("login failed:", error);
        let message = "Login failed. Please try again.";

        const msg = error instanceof Error ? error.message : "";
        if (msg.includes("network") || msg.includes("Network request failed")) {
          message = "Network error. Please check your connection.";
        } else if (msg.includes("Email not verified") || msg.includes("EMAIL_NOT_VERIFIED")) {
          message = "Please verify your email before logging in. Check your inbox and spam folder.";
        } else if (msg.includes("Invalid email or password") || msg.includes("INVALID_EMAIL_OR_PASSWORD")) {
          message = "Invalid username or password.";
        }
        setSnackMessage(message);
        toggleSnack(true);
      }
    }
  };

  const onLoginPress = async () => {
    Keyboard.dismiss();
    try {
      setLoading(true);
      await handleLogin();
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "stretch" }}
      style={{ backgroundColor: "#F4DFCD" }}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground source={require("../../../assets/splash.jpg")} className="flex-1 justify-center" resizeMode="cover">
        <Snackbar
          visible={snackState}
          onDismiss={onDismissSnackBar}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <Text className="font-inter text-center">{snackMessage}</Text>
        </Snackbar>
        {firstClick ? (
          <TouchableOpacity activeOpacity={1} className="mb-[200px] items-center justify-center self-center py-[200px]" onPress={fadeOut}>
            <Animated.Text className="font-inter text-[50px] font-bold text-[#111111] mb-[70px]" style={{ opacity: fadeAnim }}>
              Where's {"\n"} Religion?
            </Animated.Text>
          </TouchableOpacity>
        ) : (
          <View className="h-[500px] w-[300px] items-center justify-center self-center rounded-[10px] bg-white/60 shadow-md" style={{ elevation: 10, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 10 }}>
            <Text className="font-inter mb-[50px] text-[50px] font-bold text-[#111111]">Login</Text>
            <View className="mb-5 h-[50px] w-4/5 items-start justify-center rounded-full border-2 border-gray-500 bg-white p-5">
              <TextInput
                className="font-inter h-[50px] w-full rounded-full text-[16px] text-[#111111]"
                placeholder="Email..."
                placeholderTextColor="#003f5c"
                value={username}
                onChangeText={(text) => setUsername(text)}
                onSubmitEditing={handleLogin}
                testID="email-input"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-5 h-[50px] w-4/5 items-start justify-center rounded-full border-2 border-gray-500 bg-white p-5">
              <TextInput
                secureTextEntry
                className="font-inter h-[50px] w-full rounded-full text-[16px] text-[#111111]"
                placeholder="Password..."
                placeholderTextColor="#003f5c"
                value={password}
                onChangeText={(text) => setPassword(text)}
                onSubmitEditing={handleLogin}
                testID="password-input"
              />
            </View>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <View className="w-[300px] items-end justify-center">
                <Text className="mb-5 mr-10 text-[12px] font-normal text-[#111111]">Forgot Password?</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLoginPress} className="mb-[10px] h-[50px] w-[200px] items-center justify-center rounded-[30px] shadow-sm" style={{ backgroundColor: "rgb(17,47,187)", elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 }} testID="login-button">
              {!loading && <Text className="font-inter text-[15px] font-semibold text-white">Login</Text>}
              {loading && <ActivityIndicator size="small" color="white" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoRegister} className="mb-[10px] h-[50px] w-[200px] items-center justify-center rounded-[30px] shadow-sm" style={{ backgroundColor: "rgb(17,47,187)", elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 }} testID="register-button">
              <Text className="font-inter text-[15px] font-semibold text-white">Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

export default LoginScreen;
