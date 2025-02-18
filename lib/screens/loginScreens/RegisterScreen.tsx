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
          administrator: true,
          contributor: true,
        },
        createdAt: Timestamp.now(),
      };
      await setDoc(doc(db, "users", user.uid), firestoreData);

      // Set success message and navigate to login screen
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
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require("../../../assets/splash.jpg")} style={styles.imageBackground}>
        <Snackbar visible={snackState} onDismiss={() => onDismissSnackBar} style={styles.snackbar}>
          <Text style={{ textAlign: "center" }}>{snackMessage}</Text>
        </Snackbar>
        <View style={styles.registerBox}>
          <Text style={styles.title}>Register</Text>
          <View style={{marginTop: 50}} >
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
    alignSelf: "center",
    elevation: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
    textAlign: "left",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 40,
    marginTop: 10,
    paddingVertical: 7,
    fontSize: 14,
    paddingLeft: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#6C47FF",
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  signIn: {
    color: "#6C47FF",
    fontWeight: "bold",
  },
  snackbar: {
    backgroundColor: "white",
    alignItems: "center",
  },
});

export default RegistrationScreen;
