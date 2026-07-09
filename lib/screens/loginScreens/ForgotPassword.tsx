import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { authClient, AUTH_API_URL } from "../../auth/client";
import { useRouter } from "expo-router";
import { validateEmail as checkEmail } from "../../utils/validation";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (checkEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      const base = AUTH_API_URL ? AUTH_API_URL.replace(/\/$/, "") : "";
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${base}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || "Failed to send reset email.");
      }

      Alert.alert("Success", `If an account exists for ${email.trim()}, a password reset link has been sent.`);
      router.back();
    } catch (error: any) {
      let message = error?.message || "Failed to send reset email.";

      if (message.includes("too many requests") || message.includes("429")) {
        message = "Too many reset attempts. Please wait a moment and try again.";
      }

      Alert.alert("Error", message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "stretch" }}
        style={{ backgroundColor: "#F4DFCD" }}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground source={require("../../../assets/splash.jpg")} className="flex-1 justify-center" resizeMode="cover">
          <View
            className="h-[400px] w-[300px] items-center self-center rounded-[10px] bg-white/85 p-5"
            style={{ elevation: 10, shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 10 }}
          >
            <Text className="mb-5 text-[28px] font-bold text-[#111111]">Forgot Password</Text>
            <Text className="mb-5 text-center text-[16px] text-[#555555]">Enter your email to receive a password reset link.</Text>
            <View className="mb-5 h-[50px] w-full justify-center rounded-full border border-gray-500 bg-white px-5">
              <TextInput
                className="h-[50px] w-full rounded-full text-[16px] text-[#111111]"
                placeholder="Email..."
                placeholderTextColor="#003f5c"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              onPress={handlePasswordReset}
              className="mb-[10px] h-[50px] w-[200px] items-center justify-center rounded-[30px] shadow-sm"
              style={{ backgroundColor: "rgb(17,47,187)", elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3 }}
            >
              <Text className="text-[15px] font-semibold text-white">Send Reset Link</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mt-5" onPress={() => router.back()}>
              <Text className="text-[16px] font-bold" style={{ color: "rgb(17,47,187)" }}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;
