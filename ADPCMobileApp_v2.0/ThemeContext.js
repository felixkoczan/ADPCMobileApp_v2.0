// ThemeContext.js

import { createContext } from 'react';

/**
 * ThemeContext is created with a default value of 'dark'.
 * This context will allow components of the application to access and react to the current theme,
 * enabling theme switching functionality (e.g., from dark to light mode) across the app.
 * The default value 'dark' means that if no ThemeProvider wraps a component,
 * the component will use 'dark' as its default theme setting.
 */
const ThemeContext = createContext('dark');

// Export ThemeContext to be imported and used by other components to access or provide theme settings.
export default ThemeContext;