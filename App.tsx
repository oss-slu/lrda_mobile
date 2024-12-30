import React, { useState, useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store/store';
import { AddNoteProvider } from './lib/context/AddNoteContext';
import 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/lib/integration/react'; 


export default function App() {
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AddNoteProvider>
            <AppNavigator />
            <Toast />
          </AddNoteProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
