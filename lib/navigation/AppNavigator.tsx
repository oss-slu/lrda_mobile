// import { createStackNavigator } from '@react-navigation/stack';
// import { NavigationContainer } from '@react-navigation/native';
// import React,{Component}  from 'react';

// import HomeScreen from '../screens/HomeScreen';
// import AddNoteScreen from '../screens/AddNoteScreen';
// import { Note } from '../../types';
// import EditNote from '../components/EditNote';

// export type RootStackParamList = {
//   Home: undefined;
//   AddNote: { onSave: (note: Note) => void };
//   EditNote: { note: Note; onSave: (note: Note) => void };
// };

// const Stack = createStackNavigator<RootStackParamList>();

// const AppNavigator: React.FC = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{ title: 'Notes' }}
//         />
//         <Stack.Screen
//           name="AddNote"
//           component={AddNoteScreen}
//           options={{ title: 'Add Note' }}
//         />
//         <Stack.Screen
//   name="EditNote"
//   component={EditNote}
//   options={{ title: 'Edit Note' }}
// />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default AppNavigator;
