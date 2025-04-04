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
import { validateEmail, validatePassword } from "../../utils/validation";
import { defaultTextFont } from "../../../styles/globalStyles";

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
          administrator: true,
          contributor: true,
        },
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, "users", user.uid), firestoreData);

      // Set success message and navigate to login screen
      setRegistrationSuccess(true);
      setSnackMessage("Signup successful!");
      setSnackState(true);

      } catch (error) {
        setRegistrationSuccess(false);
        let message = "Signup failed. Error: " + error;
        console.log(error);
        if (error.message.includes("auth/email-already-in-use")) {
          message = "The email address is already in use by another account.";
        }
        setSnackMessage(message);
        setSnackState(true);
      }
  };

  const onDismissSnackBar = () => {
    setSnackState(false);
    if (registrationSuccess) {
      navigation.navigate("Login");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require("../../../assets/splash.jpg")} style={styles.imageBackground}>
        <Snackbar visible={snackState} onDismiss={onDismissSnackBar} duration={1500} style={styles.snackbar}>
          <Text style={{...defaultTextFont, textAlign: "center" }}>{snackMessage}</Text>
        </Snackbar>
        <View style={styles.registerBox}>
          <Text style={styles.title}>Register</Text>
          <View style={{marginTop: 40}} >
          <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#7D7D7D" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#7D7D7D" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#7D7D7D" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#7D7D7D" value={password} onChangeText={setPassword} />
          <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry placeholderTextColor="#7D7D7D" value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.signIn} onPress={() => navigation.navigate("Login")}>Sign In</Text>
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
