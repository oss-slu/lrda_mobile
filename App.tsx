import React, { useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import { LogBox } from 'react-native';
import { ThemeProvider } from './lib/components/ThemeProvider';

LogBox.ignoreAllLogs();

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator/>
    </ThemeProvider>
  );
}
