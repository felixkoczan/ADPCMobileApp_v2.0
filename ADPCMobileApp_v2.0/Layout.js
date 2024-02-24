import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import ThemeContext from './ThemeContext';

const Layout = ({ children }) => {
    const { theme } = useContext(ThemeContext);


  return (

      <View style={styles.content}>{children}
      
        <Text style={[styles.footerText, {color: theme.color}]}>© 2024 Sustainable Computing Lab. All rights reserved.</Text>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1, // Takes up all space except for the footer
    justifyContent: 'center',
  },
  footer: {
    height: 50, // Adjust the height of the footer as needed
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8', // Optional: background color for the footer
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    justifyContent: 'center',
  },
});

export default Layout;
