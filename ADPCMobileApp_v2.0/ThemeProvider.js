// ThemeProvider.js
/**
 * The ThemeProvider component encapsulates children components,
 * providing them access to the app's theme context. This allows for
 * dynamic theme switching (e.g., from light to dark mode) throughout the app.
 */
import React, { useState } from 'react';
import ThemeContext from './ThemeContext';

// define colors for the lightTheme
const lightTheme = {
  backgroundColor: '#FFFFFF',
  textColor: '#1f1f1f',
  buttonColor: '#FFFFFF',
  buttonTextColor: '#1f1f1f',
  isDark: 'false'
};

// define colors for the darkTheme
const darkTheme = {
  backgroundColor: '#1f1f1f',
  textColor: '#FFFFFF',
  buttonColor: '#1f1f1f',
  buttonTextColor: '#FFFFFF',
  isDark: 'true' // toggle in Settings lets the user set 'isDark' to true
};

const ThemeProvider = ({ children }) => {
  // State hook for the current theme. Defaults to lightTheme upon initial load.
  const [theme, setTheme] = useState(lightTheme);

  /**
   * toggleTheme is a function that switches the app's current theme between
   * light and dark themes. It checks the current theme and sets it to the
   * opposite theme.
   */
  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  /**
   * The ThemeContext.Provider component makes the `theme` object and the
   * `toggleTheme` function available to any child components in the app,
   * enabling them to access the current theme and toggle the theme if necessary.
   */
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children} 
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;