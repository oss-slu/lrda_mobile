import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";
import { signUpWithEmail } from "../../auth/client";
import { validateEmail, validatePassword } from "../../utils/validation";
import { defaultTextFont } from "../../../styles/globalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

/**
 * Clears the navigation-related keys from AsyncStorage.
 * Keys include: "Explore", "AddNote", "MorePage", "Library", and "HomeScreen".
 */
const clearNavigationKeys = async (): Promise<void> => {
  try {
    const keysToRemove = ["Explore", "AddNote", "MorePage", "Library", "HomeScreen"];
    await AsyncStorage.multiRemove(keysToRemove);
    console.log("Navigation keys removed successfully");
  } catch (error) {
    console.error("Error removing navigation keys:", error);
  }
};

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
      const { error } = await signUpWithEmail({
        email,
        password,
        name: fullName.trim(),
      });

      if (error) {
        throw new Error(error.message || "Signup failed. Please try again.");
      }

      await clearNavigationKeys();

      // Set success message and navigate to login screen
      setRegistrationSuccess(true);
      setSnackMessage("Signup successful! Please verify your email before logging in.");
      setSnackState(true);
    } catch (error: any) {
      setRegistrationSuccess(false);
      let message = error?.message || "Signup failed. Please try again.";
      console.log(message);
      if (message.includes("auth/email-already-in-use") || message.includes("User already exists")) {
        message = "The email address is already in use by another account.";
      } else if (message.includes("Password too weak")) {
        message = "Password must include upper/lowercase letters, a number, and a special character.";
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
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require("../../../assets/splash.jpg")} style={styles.imageBackground}>
        <Snackbar visible={snackState} onDismiss={onDismissSnackBar} duration={1500} style={styles.snackbar}>
          <Text style={{ ...defaultTextFont, textAlign: "center" }}>{snackMessage}</Text>
        </Snackbar>
        <View style={styles.registerBox}>
          <Text style={styles.title}>Register</Text>
          <View style={{ marginTop: 40 }}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#7D7D7D"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#7D7D7D"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#7D7D7D" value={email} onChangeText={setEmail} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor="#7D7D7D"
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor="#7D7D7D"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.signIn} onPress={() => router.replace("/(auth)/login")}>
              Sign In
            </Text>
          </Text>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  registerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.80)",
    padding: 25,
    borderRadius: 10,
    width: "85%",
    minHeight: "auto",
    alignSelf: "center",
    elevation: 0,
  },
  title: {
    ...defaultTextFont,
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 0,
    paddingLeft: 10,
    paddingTop: 10,
    textAlign: "left",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 40,
    marginTop: 0,
    paddingVertical: 7,
    fontSize: 14,
    paddingLeft: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "rgb(17,47,187)",
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    ...defaultTextFont,
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  loginText: {
    ...defaultTextFont,
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#000",
  },
  signIn: {
    ...defaultTextFont,
    color: "rgb(17,47,187)",
    fontWeight: "bold",
  },
  snackbar: {
    backgroundColor: "white",
    alignItems: "center",
  },
});

export default RegistrationScreen;
