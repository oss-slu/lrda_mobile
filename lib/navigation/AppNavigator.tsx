import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import HomeScreen, { HomeScreenProps } from '../screens/HomeScreen';
import LoginScreen from '../screens/loginScreens/LoginScreen';
import RegisterScreen from '../screens/loginScreens/RegisterScreen';
import AddNoteScreen from '../screens/AddNoteScreen';
import EditNote, { EditNoteProps } from '../components/EditNote';
import { Note } from '../../types';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  AddNote: { onSave: (note: Note) => void };
  EditNote: { note: Note; onSave: (note: Note) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Home"
          component={(props: HomeScreenProps) => <HomeScreen {...props} />}
          options={{ headerShown: false, gestureEnabled: false}}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditNote"
          component={(props: EditNoteProps) => <EditNote {...props} />}
          options={{headerShown: false }}
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
    </NavigationContainer>
  );
};

export default AppNavigator;
