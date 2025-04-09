import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config"; // Firebase auth instance
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// Utility function to validate email format
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ForgotPassword: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        `A password reset link has been sent to ${email}.`
      );
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email.");
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: "#F4DFCD" }}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground
        source={require("../../../assets/splash.jpg")}
        style={styles.imageBackground}
      >
        <View style={styles.resetBox}>
          <Text style={styles.logo}>Forgot Password</Text>
          <Text style={styles.instructions}>
            Enter your email to receive a password reset link.
          </Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Email..."
              placeholderTextColor="#003f5c"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity onPress={handlePasswordReset} style={styles.buttons}>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
              Send Reset Link
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  resetBox: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    height: 400,
    width: 300,
    borderRadius: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    padding: 20,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#111111",
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginBottom: 20,
  },
  inputView: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderColor: "gray",
    borderWidth: 1,
  },
  inputText: {
    height: 50,
    color: "#111111",
    fontSize: 16,
    width: "100%",
    borderRadius: 25,
  },
  buttons: {
    backgroundColor: "rgb(17,47,187)",
    width: 200,
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgb(17,47,187)",
  },
});

export default ForgotPassword;
