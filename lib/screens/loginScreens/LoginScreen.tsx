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
import { useDispatch, useSelector } from "react-redux";
import { setNavState } from "../../../redux/slice/navigationSlice";
import { RootState } from "../../../redux/store/store";
import { User } from "../../models/user_class";
import { removeItem } from "../../utils/async_storage";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

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
  const dispatch = useDispatch();
  const [hasNavigated, setHasNavigated] = useState(false);

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setFirstClick(false));
  };

  useEffect(() => {
    if (navState === "home" && !hasNavigated) {
      setHasNavigated(true);
      navigation.navigate("HomeTab");
    }
  }, [navState, hasNavigated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fadeOut();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  console.log("in login page the redux value is ", navState);

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
      try {
        const status = await user.login(username, password);
        if (status === "success") {
          const userId = await user.getId();
          if (userId !== null) {
            setUsername("");
            setPassword("");
            dispatch(setNavState("home"));
          }
        }
      } catch (error) {
        console.log("login failed :", error);
        toggleSnack(true);
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
          {/* Overlay gradient */}
          <Snackbar
              visible={snackState}
              onDismiss={onDismissSnackBar}
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
              }}
          >
            <Text style={{ textAlign: "center", fontFamily: "Espial-Regular"}}>Invalid User Credentials</Text>
          </Snackbar>
          {firstClick ? (
              <TouchableOpacity activeOpacity={1} style={styles.title} onPress={fadeOut}>
                <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
                  Where's {"\n"} Religion?
                </Animated.Text>
              </TouchableOpacity>
          ) : (
              <View style={styles.loginBox}>
                <Text style={[styles.logo, styles.loginTitle]}>Login</Text>
                <View style={styles.inputView}>
                  <TextInput
                      style={styles.inputText}
                      placeholder="Email"
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
                      placeholder="Password"
                      placeholderTextColor="#003f5c"
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      onSubmitEditing={handleLogin}
                      testID="password-input"
                  />
                </View>
                <TouchableOpacity>
                  <Text style={styles.forgot}>Forgot Password</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onLoginPress} style={styles.primaryButton} testID="login-button">
                  {!loading && (
                      <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
                        Sign In
                      </Text>
                  )}
                  {loading && <ActivityIndicator size="small" color="white" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGoRegister} style={styles.registerButton} testID="register-button">
                  <Text style={[styles.registerText, { fontFamily: "CustomFont" }]}>
                    Don't have an account?{' '}
                    <Text style={styles.registerLink} onPress={handleGoRegister}>
                      Sign up
                    </Text>
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
    borderBottomWidth: 1,
    borderColor: "black",
    marginBottom: 10,
    marginTop: 40,
  },
  inputText: {
    height: 30,
    color: "#111111",
    fontSize: 14,
    width: "100%",
  },
  forgot: {
    color: "#0000EE",
    fontSize: 12,
    fontWeight: "600",
    alignSelf: "flex-end",
    marginTop: 20,
    marginRight: -115,

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
  loginTitle: {
    alignSelf: "flex-start",
    marginLeft: 30,
    marginBottom: 30,
    fontSize: 32,
  },
  loginBox: {
    backgroundColor: "rgba(245,245,245,0.8)",
    width: 350,
    height: 650,
    borderRadius: 20,
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: .2,
    shadowRadius: 5,
  },
  primaryButton: {
    backgroundColor: "#6A0DAD", // Vibrant purple
    width: "90%", // Full-width (matching inputs)
    height: 43,
    borderRadius: 10,
    alignItems: "center", // Left-align text
    justifyContent: "center",
    marginTop: 70,
  },
  registerButton: {
    alignSelf: "flex-end",
    marginRight: 62,
    fontSize: 12,
    fontWeight: "400",
    marginTop: 8,
  },
  linkText: {
    color: "#0000EE", // Blue text for secondary action
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    paddingTop: 20,
  },
  registerText: {
    color: "#111111", // Default text color for the register message
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  registerLink: {
    color: "#0000EE", // Blue color for the clickable "Register now" link
  },
});

export default LoginScreen;
