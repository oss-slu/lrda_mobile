import React, { useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from './redux/store/store';
import { AddNoteProvider } from './lib/context/AddNoteContext';

LogBox.ignoreAllLogs();

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AddNoteProvider>
        <AppNavigator />
        <Toast />
        </AddNoteProvider>
      </ThemeProvider>
    </Provider>
  );
}
