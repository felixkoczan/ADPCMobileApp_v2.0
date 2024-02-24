import React, { useState, useContext } from 'react';
import ThemeContext from './ThemeContext';

const lightTheme = {
  backgroundColor: '#FFFFFF',
  textColor: '#1f1f1f',
  buttonColor: '#FFFFFF',
  buttonTextColor: '#1f1f1f',
  isDark: 'false'
};

const darkTheme = {
  backgroundColor: '#1f1f1f',
  textColor: '#FFFFFF',
  buttonColor: '#1f1f1f',
  buttonTextColor: '#FFFFFF',
  isDark: 'true'
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme); // Default to light mode

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
