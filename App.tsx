import React, { useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';
import Toast from 'react-native-toast-message';

LogBox.ignoreAllLogs();

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator/>
      <Toast/>
    </ThemeProvider>
  );
}
