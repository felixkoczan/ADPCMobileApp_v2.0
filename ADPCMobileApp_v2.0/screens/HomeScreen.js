// HomeScreen.js
// Visual Entry point for the user after granting permissions.
// Contains navigation to the most crucial functionalities.
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ThemeContext from '../ThemeContext';
import Logo from '../assets/adpc_logo_high.png';
import { useBLE } from '../BLEContext';

const HomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { startScan } = useBLE();
    
    
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <Image source={Logo} style={styles.logo} />
        <Text style={[styles.title, { color: theme.textColor }]}>Welcome to ADPC-IoT</Text>
        <TouchableOpacity
          style={[styles.discoverButton, 
          { backgroundColor: theme.backgroundColor, borderColor: theme.textColor }]}
          onPress={() => {
            // Call the startScan function from BLEContext.js
            startScan();
            // Navigate to the 'Device Registration' screen
            navigation.navigate('Discover Devices');
          }}>
          <Text style={[styles.buttonText, { color: theme.textColor }]}>
            Scan for Devices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.textColor }]}
            onPress={() => navigation.navigate('Manage Consents')}>
            <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Manage Consents</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.textColor }]}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Settings</Text>
        </TouchableOpacity>
        {/* IMPORTANT: only screen for device registration implemented not functionality or storage */ 
        /*<TouchableOpacity
            style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.textColor }]}
            onPress={() => navigation.navigate('Device Registration')}>
            <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Register Device</Text>
        </TouchableOpacity> */}
        </View>    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
},
  button: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    width: '60%',
  },
  discoverButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    width: '60%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    
  },
  logo: {
    width: 223,
    height: 100,
    marginBottom: 20, 
  },
});

export default HomeScreen;