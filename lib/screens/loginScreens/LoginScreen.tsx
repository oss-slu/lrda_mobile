// LoginScreen.tsx

import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";
import { useDispatch, useSelector } from 'react-redux';
import { setNavState } from "../../../redux/slice/navigationSlice";
import { RootState } from "../../../redux/store/store";
import { User } from "../../models/user_class";
import { removeItem } from "../../utils/async_storage";

const user = User.getInstance();

type LoginProps = {
  navigation: any;
  route: any;
};

const LoginScreen: React.FC<LoginProps> = ({ navigation, route }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstClick, setFirstClick] = useState(true);
  const [snackState, toggleSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navState = useSelector((state: RootState) => state.navigation.navState);
  const dispatch = useDispatch()


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

  console.log("in login page the redux value is ", navState)

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      await SplashScreen.hideAsync();
    })();
  }, []);

  const handleGoRegister = () => {
    navigation.navigate("Register");
  };

  const onDismissSnackBar = () => toggleSnack(false);

  const handleLogin = async () => {

    if (username === "" || password === "") {
      toggleSnack(!snackState);
    } else {

      // changes made by karthik 

      try {
        const status = await user.login(username, password)
        if (status == "success") {
          const userId = await user.getId();
          // console.log("in login page, Inside the is statement of success ", userId)
          if (userId !== null) {
              setUsername("")
              setPassword("")
              dispatch(setNavState('home'));
              navigation.navigate("HomeTab");  // Navigate to the HomeTab
          }
        }
      }
      catch (error) {
        console.log("login failed :", error);
        toggleSnack(true)
      }

    }
  };

  const clearOnboarding = async () => {
    try {
      await removeItem("onboarded");
      console.log("Onboarding key cleared!");
    } catch (error) {
      console.error("Failed to clear the onboarding key.", error);
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
      contentContainerStyle={styles.container}
      style={{ backgroundColor: "#F4DFCD" }}
      keyboardShouldPersistTaps="handled"
    >
      <ImageBackground
        source={require("../../../assets/splash.jpg")}
        style={styles.imageBackground}
      >
        <Snackbar
          visible={snackState}
          onDismiss={onDismissSnackBar}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
        >
          <Text style={{ textAlign: "center" }}>Invalid User Credentials</Text>
        </Snackbar>
        {firstClick ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.title}
            onPress={fadeOut}
          >
            <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
              Where's {"\n"} Religion?
            </Animated.Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loginBox}>
            <Text style={[styles.logo, { marginBottom: 50 }]}>Login</Text>
            <View style={styles.inputView}>
              <TextInput
                style={styles.inputText}
                placeholder="Email..."
                placeholderTextColor="#003f5c"
                value={username}
                onChangeText={(text) => setUsername(text)}
                onSubmitEditing={handleLogin}
                testID="email-input"
                autoCapitalize="none"
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
                onSubmitEditing={handleLogin}
                testID="password-input"
              />
            </View>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLoginPress} style={styles.buttons} testID="login-button">
              {!loading && <Text style={{color: "white", fontWeight: "600", fontSize: 15}}>
                Login
                </Text>}
              {loading && <ActivityIndicator size="small" color="white" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoRegister} style={styles.buttons} testID="register-button">
              <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  forgot: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 20,
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  title: {
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    marginBottom: 200,
    paddingVertical: 200,
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

export default LoginScreen;