import React, { useEffect, useState } from "react";
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
import Library from "../screens/Library";
import AddNoteBtnComponent from "../components/AddNoteBtnComponent";
import { Platform } from "react-native";
import ResourceScreen from "../screens/ResourceScreen";
import ReadMoreScreen from "../screens/ReadMoreScreen";
import AppThemeSelectorScreen from "../screens/AppThemeSelectorScreen";
import { Keyboard } from "react-native";

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
    <Stack.Screen
      name="AccountPage"
      component={ProfilePage}
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
      options={{ title: "Team", headerShown: false, headerBackTitleVisible: false }}
    />
    <Stack.Screen
      name="Resource"
      component={ResourceScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="ReadMore"
      component={ReadMoreScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />
    <Stack.Screen
      name="AppTheme"
      component={AppThemeSelectorScreen}
      options={{ headerShown: false, gestureEnabled: false }}
    />

  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { theme, isDarkmode } = useTheme();
  const dispatch = useDispatch();
  const navState = useSelector((state: RootState) => state.navigation.navState);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
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
         tabBarShowLabel: true, // Enable default labels
         tabBarHideOnKeyboard: true,
         tabBarStyle: {
           backgroundColor: 'transparent',
           position: 'absolute',
           bottom: Platform.OS === 'ios' ? -20 : 0,
           left: 0,
           right: 0,
           elevation: 0,
           borderTopWidth: 0,
           tabBarStyle: {
            backgroundColor: 'transparent',
            position: 'absolute',
            bottom: 0, // Ensures it's positioned correctly on all platforms
            left: 0,
            right: 0,
            elevation: 0,
            borderTopWidth: 0,
            paddingBottom: Platform.OS === 'ios' ? 30 : 15, // More padding for Android too
            height: Platform.OS === 'ios' ? '10%' : '8%', // Increase height for Android as well
          },
          
         },
         tabBarItemStyle: {
           backgroundColor: theme.primaryColor,
           height: '100%'
         }
       }}
     >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            // component={AppThemeSelectorScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Home',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name="home" color={isDarkmode ? focused ? 'white' : 'grey' : focused ? 'black' : 'grey'} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="LibraryTab"
            component={Library}
            options={{
              headerShown: false,
              tabBarLabel: 'Library',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name="library" color={isDarkmode ? focused ? 'white' : 'grey' : focused ? 'black' : 'grey'} size={size} />
              ),
            }}
          />

          {!keyboardVisible && <Tab.Screen
            name="AddNotesTab"
            component={AddNoteScreen}
            options={{
              headerShown: false,
              tabBarLabel: 'Add Note',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library" color={color} size={size} />
              ),
              tabBarButton: (props) => (<AddNoteBtnComponent />)
            }}
          />
          }

          <Tab.Screen
            name="Explore"
            component={ExploreScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name="map" color={isDarkmode ? focused ? 'white' : 'grey' : focused ? 'black' : 'grey'} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="More"
            component={MoreStack}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name="menu-outline" color={isDarkmode ? focused ? 'white' : 'grey' : focused ? 'black' : 'grey'} size={size + 10} />
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
