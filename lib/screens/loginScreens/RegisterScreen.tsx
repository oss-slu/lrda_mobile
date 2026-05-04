import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";
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
  const [snackState, setSnackState] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  const handleRegister = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setSnackMessage(emailError);
      setSnackState(true);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setSnackMessage(passwordError);
      setSnackState(true);
      return;
    }

    if (password !== confirmPassword) {
      setSnackMessage("Passwords do not match");
      setSnackState(true);
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
      setSnackMessage("Signup successful! Please verify your email before logging in.");
      setSnackState(true);
    } catch (error: any) {
      setRegistrationSuccess(false);
      let message = error?.message || "Signup failed. Please try again.";
      console.log(message);
      if (message.includes("User already exists") || message.includes("email-already-in-use")) {
        message = "The email address is already in use by another account.";
      } else if (message.includes("Password too weak")) {
        message = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
      }
      setSnackMessage(message);
      setSnackState(true);
    }
  };

  const onDismissSnackBar = () => {
    setSnackState(false);
    if (registrationSuccess) {
      router.replace("/(auth)/login");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, justifyContent: "center" }}>
      <ImageBackground source={require("../../../assets/splash.jpg")} className="flex-1 justify-center" resizeMode="cover">
        <Snackbar visible={snackState} onDismiss={onDismissSnackBar} duration={1500} style={{ backgroundColor: "white", alignItems: "center" }}>
          <Text className="font-inter text-center">{snackMessage}</Text>
        </Snackbar>
        <View className="w-[85%] self-center rounded-[10px] bg-white/80 p-[25px]">
          <Text className="font-inter pl-[10px] pt-[10px] text-left text-[32px] font-bold text-black">Register</Text>
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
          <TouchableOpacity onPress={handleRegister} className="mt-5 items-center rounded-[15px] py-[10px]" style={{ backgroundColor: "rgb(17,47,187)" }}>
            <Text className="font-inter text-[22px] font-bold text-white">Sign Up</Text>
          </TouchableOpacity>
          <Text className="font-inter mt-5 text-center text-[14px] text-black">
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
