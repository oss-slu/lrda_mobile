import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import HomeScreen, { HomeScreenProps } from '../screens/HomeScreen';
import AddNoteScreen from '../screens/AddNoteScreen';
import EditNote, { EditNoteProps } from '../components/EditNote';
import { Note } from '../../types';

export type RootStackParamList = {
  Home: undefined;
  AddNote: { onSave: (note: Note) => void };
  EditNote: { note: Note; onSave: (note: Note) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={(props: HomeScreenProps) => <HomeScreen {...props} />}
          options={{ title: 'Notes' }}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{ title: 'Add Note' }}
        />
        <Stack.Screen
          name="EditNote"
          component={(props: EditNoteProps) => <EditNote {...props} />}
          options={{ title: 'Edit Note' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
