import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { authClient } from "../../auth/client";
import { validateEmail, validatePassword } from "../../utils/validation";
import { useRouter } from "expo-router";

const RegistrationScreen: React.FC = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegister = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Toast.show({ type: "error", text1: emailError });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Toast.show({ type: "error", text1: passwordError });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`;
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName.trim(),
      });

      if (error) {
        throw new Error(error.message || "Signup failed. Please try again.");
      }

      setRegistrationSuccess(true);
      Toast.show({
        type: "success",
        text1: "Signup successful! Please verify your email before logging in.",
        onHide: () => router.replace("/(auth)/login"),
      });
    } catch (error: any) {
      setRegistrationSuccess(false);
      let message = error?.message || "Signup failed. Please try again.";
      console.log(message);
      if (message.includes("User already exists") || message.includes("email-already-in-use")) {
        message = "The email address is already in use by another account.";
      } else if (message.includes("Password too weak")) {
        message = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
      }
      Toast.show({ type: "error", text1: message });
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, justifyContent: "center" }}>
      <ImageBackground source={require("../../../assets/splash.jpg")} className="flex-1 justify-center" resizeMode="cover">
        <View className="w-[85%] self-center rounded-[10px] bg-white/80 p-[25px]">
          <Text className="pl-[10px] pt-[10px] text-left font-inter text-[32px] font-bold text-black">Register</Text>
          <View className="mt-10">
            <TextInput
              className="mb-10 border-b border-black pb-[7px] pl-[10px] text-[14px] text-black"
              placeholder="First Name"
              placeholderTextColor="#7D7D7D"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              className="mb-10 border-b border-black pb-[7px] pl-[10px] text-[14px] text-black"
              placeholder="Last Name"
              placeholderTextColor="#7D7D7D"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              className="mb-10 border-b border-black pb-[7px] pl-[10px] text-[14px] text-black"
              placeholder="Email"
              placeholderTextColor="#7D7D7D"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              className="mb-10 border-b border-black pb-[7px] pl-[10px] text-[14px] text-black"
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#7D7D7D"
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              className="mb-10 border-b border-black pb-[7px] pl-[10px] text-[14px] text-black"
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor="#7D7D7D"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity
            onPress={handleRegister}
            className="mt-5 items-center rounded-[15px] py-[10px]"
            style={{ backgroundColor: "rgb(17,47,187)" }}
          >
            <Text className="font-inter text-[22px] font-bold text-white">Sign Up</Text>
          </TouchableOpacity>
          <Text className="mt-5 text-center font-inter text-[14px] text-black">
            Already have an account?{" "}
            <Text className="font-inter font-bold" style={{ color: "rgb(17,47,187)" }} onPress={() => router.replace("/(auth)/login")}>
              Sign In
            </Text>
          </Text>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

export default RegistrationScreen;
