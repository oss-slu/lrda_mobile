import React, { useEffect } from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import ExploreScreen from "../screens/mapPage/ExploreScreen";
import ProfilePage from "../screens/ProfilePage";
import MorePage from "../screens/MorePage";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/loginScreens/LoginScreen";
import RegisterScreen from "../screens/loginScreens/RegisterScreen";
import AddNoteScreen from "../screens/AddNoteScreen";
import EditNote from "../components/EditNote";
import OnboardingScreen from "../screens/OnboardingScreen";
import VideoPlayerScreen from "../screens/VideoPlayer"; // Import the VideoPlayerScreen
import { User } from "../models/user_class";
import { getItem } from "../utils/async_storage";
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../components/ThemeProvider';
import ToastMessage from 'react-native-toast-message';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store/store";
import { setNavState } from "../../redux/slice/navigationSlice";
import TeamPage from "../screens/TeamPage";

SplashScreen.preventAutoHideAsync();

const user = User.getInstance();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="AddNote"
      component={AddNoteScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="EditNote"
      component={EditNote}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="VideoPlayer"
      component={VideoPlayerScreen}
      options={{ headerShown: false, gestureEnabled: true }}
    />
  </Stack.Navigator>
);

const MoreStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MorePage"
      component={MorePage}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="TeamPage"
      component={TeamPage}
      options={{ title: "Team",headerShown: false, headerBackTitleVisible: false }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { theme, isDarkmode } = useTheme();
  const dispatch = useDispatch();
  const navState = useSelector((state: RootState) => state.navigation.navState);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await getItem("onboarded");
      const userId = await user.getId();

      if (onboarded === "1" && userId) {
        dispatch(setNavState("home"));
      } else if (onboarded === "1") {
        dispatch(setNavState("login"));
      } else {
        dispatch(setNavState("onboarding"));
      }
      await SplashScreen.hideAsync();
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    user.setLoginCallback((isLoggedIn) => {
      setNavState(isLoggedIn ? "home" : "login");
    });
  }, []);

  return (
    <NavigationContainer theme={isDarkmode ? DarkTheme : DefaultTheme}>
      {navState === "onboarding" && (
        <Stack.Navigator initialRouteName="Onboarding">
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
      {navState === "login" && (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
      {navState === "home" && (
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Explore"
            component={ExploreScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="map" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="More"
            component={MoreStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="menu-outline" color={color} size={size + 10} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
      <ToastMessage position="bottom" />
    </NavigationContainer>
  );
};

export default AppNavigator;
