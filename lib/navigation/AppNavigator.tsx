import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ExploreScreen from "../screens/mapPage/ExploreScreen.js";
import ProfilePage from "../screens/ProfilePage";
import MorePage from "../screens/MorePage";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/loginScreens/LoginScreen";
import RegisterScreen from "../screens/loginScreens/RegisterScreen";
import AddNoteScreen from "../screens/AddNoteScreen";
import EditNote from "../components/EditNote";
import { RootStackParamList } from "../../types";
import { createStackNavigator } from "@react-navigation/stack";
import { User } from "../models/user_class";
import OnboardingScreen from "../screens/OnboardingScreen";
import { getItem } from "../utils/async_storage";
import { HomeScreenProps, RootTabParamList, EditNoteProps } from "../../types";

const user = User.getInstance();

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        options={{ headerShown: false, gestureEnabled: false }}
      >
        {(props: HomeScreenProps) => <HomeScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="AccountPage" component={ProfilePage} />
      <Stack.Screen
        name="EditNote"
        options={{ headerShown: false, gestureEnabled: false }}
      >
        {(props: EditNoteProps) => <EditNote {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [navState, setNavState] = useState<"onboarding" | "login" | "home">("onboarding");

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await getItem("onboarded");
      if (onboarded === "1") {
        const userId = await user.getId();
        setNavState(userId ? "home" : "login");
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    user.setLoginCallback((isLoggedIn) => {
      setNavState(isLoggedIn ? "home" : "login");
    });
  }, []);

  

  return (
    <NavigationContainer>
    {navState === "onboarding" && (
       <Stack.Navigator initialRouteName="Onboarding">
       <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
       <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
       <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
     </Stack.Navigator>
    )}
    {navState === "login" && (
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
    )}
    {navState === "home" && (
      <Tab.Navigator screenOptions={{ tabBarShowLabel: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ios-pencil" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tab1"
        component={ExploreScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ios-map" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tab2"
        component={MorePage}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size + 10} />
          ),
        }}
      />
    </Tab.Navigator>
    )}
  </NavigationContainer>
  );
  
};

export default AppNavigator;
