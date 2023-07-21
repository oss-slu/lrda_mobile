import React, { useEffect } from 'react';
import AppNavigator from './lib/navigation/AppNavigator';
import OnBoardOne from './lib/screens/onBoarding/onBoardingOne';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();

export default function App() {
  return (
    <AppNavigator />
    // <OnBoardOne />
  );
}