// Import necessary hooks and components from React and React Native.
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// Import the ThemeContext to use for dynamic theming throughout the app.
import ThemeContext from '../ThemeContext';
// Import an image to be used as a logo within the component.
import Logo from '../assets/adpc_logo_high.png';
// Import a custom hook from BLEContext to manage BLE operations.
import { useBLE } from '../BLEContext';

// Define the HomeScreen functional component, receiving navigation prop for screen navigation.
const HomeScreen = ({ navigation }) => {
    // Access the current theme from ThemeContext.
    const { theme } = useContext(ThemeContext);
    // Access BLE-related functionalities (starting a scan and checking if a scan is ongoing)
    // through the custom hook useBLE.
    const { startScan } = useBLE();
    
    
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Image source={Logo} style={styles.logo} />
            <Text style={[styles.title, { color: theme.textColor }]}>Welcome to ADPC-IoT</Text>
            <TouchableOpacity
              style={[styles.discoverButton, 
              { backgroundColor: theme.backgroundColor, borderColor: theme.textColor }]}
              onPress={() => {
                // Call the startScan function
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
                onPress={() => navigation.navigate('Device Registration')}>
                <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Register Device</Text>
            </TouchableOpacity>
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
