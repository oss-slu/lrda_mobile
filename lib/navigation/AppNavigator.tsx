import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import GoogleMap from '../screens/mapPage/googleMap';
import profilePage from '../screens/profilePage/ProfilePage';
import HomeScreen, { HomeScreenProps } from '../screens/HomeScreen';
import LoginScreen from '../screens/loginScreens/LoginScreen';
import RegisterScreen from '../screens/loginScreens/RegisterScreen';
import AddNoteScreen from '../screens/AddNoteScreen';
import EditNote, { EditNoteProps } from '../components/EditNote';
import { Note, RootStackParamList } from '../../types';
import { createStackNavigator } from '@react-navigation/stack';
import { User } from '../utils/user_class';

// Get the single instance of the User class
const user = User.getInstance();

const Placeholder = () => null;

export type RootTabParamList = {
  HomeTab: undefined;
  Tab1: undefined;
  Tab2: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false, gestureEnabled: false }}>
        {(props: HomeScreenProps) => <HomeScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="EditNote" options={{headerShown: false, gestureEnabled: false }}>
        {(props: EditNoteProps) => <EditNote {...props} />}
      </Stack.Screen>

    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(user.getId() !== null);

  // Listen for changes in the user's login state
  useEffect(() => {
    // Check the user's login state every second
    const interval = setInterval(() => {
      setIsLoggedIn(user.getId() !== null);
    }, 1000);

    // Clean up the interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
       <Tab.Navigator
       screenOptions={{ tabBarShowLabel: false }}
     >
       <Tab.Screen
         name="HomeTab"
         component={HomeStack}
         options={{
           headerShown: false, // This line hides the header
           tabBarIcon: ({ color, size }) => (
             <Ionicons name="ios-pencil" color={color} size={size} />
           ),
         }}
       />
       <Tab.Screen
          name="Tab1"
          component={GoogleMap} // Replaced 'Placeholder' with 'MapComponent'
          options={{
            headerShown: false, // This line hides the header
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ios-map" color={color} size={size} />
            ),
          }}
        />
       <Tab.Screen
         name="Tab2"
         component={profilePage}
         options={{
           headerShown: false, // This line hides the header
           tabBarIcon: ({ color, size }) => (
             <Ionicons name="ios-person" color={color} size={size} />
           ),
         }}
       />
     </Tab.Navigator>
      ) : (
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
    </NavigationContainer>
  );
};

export default AppNavigator;
