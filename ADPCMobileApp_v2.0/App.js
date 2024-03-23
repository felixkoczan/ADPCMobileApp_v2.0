// App.js, entry point into the app
// Import necessary hooks and modules from React, React Native, and other dependencies.
import React, { useEffect, useContext, useState } from 'react';
import { PermissionsAndroid, Platform, StatusBar, StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; 
import AppNavigation from './AppNavigation';
import ThemeProvider from './ThemeProvider'; 
import { BLEProvider} from './BLEContext';
import ThemeContext from './ThemeContext';

/**
 * ThemeAwareStatusBar is a functional component that adjusts the status bar
 * appearance based on the current theme (dark or light).
 */
const ThemeAwareStatusBar = () => {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content', true);
    StatusBar.setBackgroundColor(theme.backgroundColor);
  }, [theme]);

  return null;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  
  // useEffect hook to request necessary permissions upon app initialization.
  useEffect(() => {
    const requestBluetoothPermissions = async () => {
      try {
        // Check the platform and version to request appropriate permissions.
        // Android permissions defined in AndroidManifest.xml
        // iOS permissions defined in Info.plist
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          // For Android 12 (API level 31) and above, request multiple permissions including
          // location access, Bluetooth scan, and Bluetooth connect.
          const permissionsStatus = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          console.log('Permissions status:', permissionsStatus);
          // Check if all permissions are granted
          permissionsGranted = Object.values(permissionsStatus).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
        } else if (Platform.OS === 'android' && Platform.Version >= 23) {
          // For Android 6 (Marshmallow, API level 23) to Android 11, request location permission.
          // This is necessary for Bluetooth scanning due to the need to access location information.
          const locationPermissionStatus = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (locationPermissionStatus === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        }
      } catch (err) {
        console.warn(err);
      }
      setLoading(!permissionsGranted);
    };

    requestBluetoothPermissions();
  }, []);

  // Render a loading indicator while waiting for permissions
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme?.backgroundColor || '#FFF' }]}>
        
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

  // Main app content, wrapped with providers for BLE, theming, and navigation
  return (
    <BLEProvider>
      <ThemeProvider>
        <ThemeAwareStatusBar />
          <NavigationContainer>
            <AppNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </BLEProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
  },
});

export default App;