import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '../utils/async_storage';
import { colors } from './colors';
import { useSelector } from 'react-redux';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {

  const appThemeColor = useSelector((state) => state.themeSlice.theme);

  const [isDarkmode, setIsDarkmode] = useState(false);
  colors.darkColors.homeColor = appThemeColor;
  colors.lightColors.homeColor = appThemeColor;
  console.log(colors.darkColors.homeColor, appThemeColor)
  const toggleDarkmode = () => {
    setIsDarkmode((prevMode) => !prevMode);

    // Save the theme preference in AsyncStorage
    AsyncStorage.save('themePreference', !isDarkmode ? 'dark' : 'light');
  };

  useEffect(() => {
    // Load the user's theme preference from AsyncStorage on app start
    AsyncStorage.get('themePreference')
      .then((theme) => {
        setIsDarkmode(theme === 'dark');
      })
      .catch((error) => {
        console.error('Error loading theme preference:', error);
      });
  }, []);

  const theme = isDarkmode ? colors.darkColors : colors.lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkmode, toggleDarkmode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
