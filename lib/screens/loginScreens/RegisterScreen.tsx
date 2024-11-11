import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";
import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import ApiService from "../../utils/api_calls";
import { validateEmail, validatePassword } from "../../utils/validation";

type RegisterProps = {
  navigation: any;
  route: any;
};

const RegistrationScreen: React.FC<RegisterProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Combine firstName and lastName for name field
      const fullName = `${firstName} ${lastName}`;

      // Firestore user data creation
      const firestoreData = {
        uid: user.uid,
        email,
        name: fullName,
        roles: {
          administrator: false,
          contributor: true,
        },
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, "users", user.uid), firestoreData);

      // API user data creation
      const apiData = {
        "@id": user.uid,
        name: fullName,
        roles: {
          administrator: false,
          contributor: true,
        },
      };
      const response = await ApiService.createUserData(apiData);

      if (response.status !== 200) {
        setSnackMessage("Failed to create user data in API");
        setSnackState(true);
        return;
      }

      setSnackMessage("Signup successful!");
      setSnackState(true);

      navigation.navigate("Login");
    } catch (error) {
      setSnackMessage(`Signup failed: ${error}`);
      setSnackState(true);
    }
  };

  const onDismissSnackBar = () => setSnackState(false);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} style={{ backgroundColor: '#F4DFCD' }}>
      <ImageBackground source={require("../../../assets/splash.jpg")} style={styles.imageBackground}>
        <Snackbar
          visible={snackState}
          onDismiss={onDismissSnackBar}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <Text style={{ textAlign: "center" }}>{snackMessage}</Text>
        </Snackbar>
        <View style={styles.loginBox}>
          <Text style={[styles.logo, { marginBottom: 50 }]}>Register</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="First Name..."
              placeholderTextColor="#003f5c"
              value={firstName}
              onChangeText={(text) => setFirstName(text)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Last Name..."
              placeholderTextColor="#003f5c"
              value={lastName}
              onChangeText={(text) => setLastName(text)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputText}
              placeholder="Email..."
              placeholderTextColor="#003f5c"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              secureTextEntry
              style={styles.inputText}
              placeholder="Password..."
              placeholderTextColor="#003f5c"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              secureTextEntry
              style={styles.inputText}
              placeholder="Confirm Password..."
              placeholderTextColor="#003f5c"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
          </View>
          <TouchableOpacity onPress={handleRegister} style={styles.buttons}>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
              Register
            </Text>
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
    alignItems: 'stretch',
  },
  logo: {
    fontWeight: "bold",
    fontSize: 50,
    color: "#111111",
    marginBottom: 70,
  },
  inputView: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "flex-start",
    borderColor: "gray",
    borderWidth: 2,
  },
  inputText: {
    height: 50,
    color: "#111111",
    fontSize: 16,
    width: "100%",
    borderRadius: 25,
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
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
  loginBox: {
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: 500,
    width: 300,
    borderRadius: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});

export default RegistrationScreen;
