import React, { useState, useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store/store';
import { AddNoteProvider } from './lib/context/AddNoteContext';
import { EditNoteProvider } from './lib/context/EditNoteContext';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { PersistGate } from 'redux-persist/lib/integration/react'; 


export default function App() {

  const [fontsLoaded] = useFonts({
    'Inter': require('./assets/fonts/Inter.otf'),
  })

  if (!fontsLoaded) {
    return null; // Alternatively, render a loading component
  }
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AddNoteProvider>
            <EditNoteProvider>
            <AppNavigator />
            <Toast />
            </EditNoteProvider>
          </AddNoteProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
