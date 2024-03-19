// Import necessary hooks and modules from React, React Native, and other dependencies.
import React, { useEffect, useContext, useState } from 'react';
import { PermissionsAndroid, Platform, StatusBar, StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // For managing navigation.
import AppNavigation from './AppNavigation'; // Custom navigation setup.
import ThemeProvider from './ThemeProvider'; // Provides theming capabilities.
import { BLEProvider} from './BLEContext';
import ThemeContext from './ThemeContext';


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
  

  // Use the useEffect hook to request necessary permissions upon app initialization.
  useEffect(() => {

    const requestBluetoothPermissions = async () => {
      try {
        // Check the platform and version to request appropriate permissions.
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          // For Android 12 (API level 31) and above, request multiple permissions including
          // location access, Bluetooth scan, and Bluetooth connect.
          const permissionsStatus = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);
          console.log('Permissions status:', permissionsStatus);
          permissionsGranted = Object.values(permissionsStatus).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
        } else if (Platform.OS === 'android' && Platform.Version >= 23) {
          // For Android 6 (Marshmallow, API level 23) to Android 11, request location permission.
          // This is necessary for Bluetooth scanning due to the need to access location information.
          const locationPermissionStatus = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          // Log the outcome of the permission request.
          if (locationPermissionStatus === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        }
      } catch (err) {
        // Catch and log any errors that occur during the permission request process.
        console.warn(err);
      }
      setLoading(!permissionsGranted);
    };

    requestBluetoothPermissions();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme?.backgroundColor || '#FFF' }]}>
        
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Requesting permissions...</Text>
      </View>
    );
  }

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
