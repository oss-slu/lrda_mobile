import React, { useState, useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store/store';
import { AddNoteProvider } from './lib/context/AddNoteContext';
import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { PersistGate } from 'redux-persist/lib/integration/react';
import SyncService from './lib/utils/syncService'; 


export default function App() {

  const [fontsLoaded] = useFonts({
    'Inter': require('./assets/fonts/Inter.otf'),
  })

  // Initialize sync service when app starts
  useEffect(() => {
    const initializeSync = async () => {
      try {
        const syncService = SyncService.getInstance();
        await syncService.initialize();
        console.log('✅ [App] Sync service initialized');
      } catch (error) {
        console.error('❌ [App] Failed to initialize sync service:', error);
      }
    };

    if (fontsLoaded) {
      initializeSync();
    }

    // Cleanup on unmount
    return () => {
      const syncService = SyncService.getInstance();
      syncService.cleanup();
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Alternatively, render a loading component
  }
  
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
