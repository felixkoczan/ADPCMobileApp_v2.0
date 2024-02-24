// Import necessary hooks and modules from React, React Native, and other dependencies.
import React, { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'; // For managing navigation.
import AppNavigation from './AppNavigation'; // Custom navigation setup.
import ThemeProvider from './ThemeProvider'; // Provides theming capabilities.
import {BLEConnect, BLEProvider} from './BLEContext'; // Context for BLE operations.

const App = () => {

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
    };

    // Call the function to request Bluetooth permissions.
    requestBluetoothPermissions();
  }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

  // Render the app's components wrapped in context providers for BLE and theming.
  // The NavigationContainer wraps the app's navigation setup.
  return (
    <BLEProvider>
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </ThemeProvider>
    </BLEProvider>
  );
};

export default App;
