import React, { createContext, useContext, useState } from 'react';
import { colors } from './colors';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [isDarkmode, setIsDarkmode] = useState(false);

  const toggleDarkmode = () => {
    setIsDarkmode((prevMode) => !prevMode);
  };

  const theme = isDarkmode ? colors.darkColors : colors.lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkmode, toggleDarkmode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
