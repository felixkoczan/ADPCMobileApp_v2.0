// Importing React hooks and various React Native components for UI rendering and interaction.
import React, { useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native'; // Hook for navigation between screens.
import ThemeContext from '../ThemeContext'; // Importing a custom theme context for styling.
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid, // Used to display short messages in Android.
  Alert, // Used to display alerts for both Android and iOS.
  Keyboard, 
  TouchableWithoutFeedback,
  StyleSheet,
  AsyncStorage, // Used for storing data locally on the device.
} from 'react-native';

// Defining the DeviceRegistrationScreen component.
const DeviceRegistrationScreen = () => {
  
  // Hook for navigation actions.
  const navigation = useNavigation();
  // State hooks for form inputs.
  const [macAddress, setMacAddress] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Accessing the theme context.
  const { theme } = useContext(ThemeContext);

  // useEffect hook to clear input fields when navigating away from the screen.
  useEffect(() => {
    const blurListener = navigation.addListener('blur', () => {
      setMacAddress('');
      setDeviceName('');
      setDeviceType('');
      setSerialNumber('');
    });

    // Cleanup listener on component unmount.
    return blurListener.remove;
  }, [navigation]);

  // Function to add a new device entry.
  const addDevice = async () => {
    // Validation to ensure all fields are filled.
    if (!macAddress || !deviceName || !deviceType || !serialNumber) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
  
    try {
      // Creating a new device object.
      const newDevice = { macAddress, deviceName, deviceType, serialNumber };
      // Retrieving existing devices from AsyncStorage.
      const storedDevices = await AsyncStorage.getItem('registeredDevices');
      const currentDevices = storedDevices ? JSON.parse(storedDevices) : [];
      // Adding the new device to the array of devices.
      currentDevices.push(newDevice);
      // Saving the updated array back to AsyncStorage.
      await AsyncStorage.setItem('registeredDevices', JSON.stringify(currentDevices));
      // Displaying a success message.
      ToastAndroid.show('Device added!', ToastAndroid.SHORT);
      // Clearing input fields.
      setMacAddress('');
      setDeviceName('');
      setDeviceType('');
      setSerialNumber('');
      // Navigating back to the home screen.
      navigation.navigate('Home');
    } catch (e) {
      // Displaying an error message if the operation fails.
      Alert.alert('Error', 'Failed to save the device');
    }
  };

  // Render method for the UI.
  return (
    // Dismisses the keyboard when touching outside of input fields.
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Input fields for device registration, styled according to the theme. */}
      <TextInput
        style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor }]}
        placeholder="MAC Address"
        placeholderTextColor={theme.textColor}
        value={macAddress}
        onChangeText={setMacAddress}
      />

      <TextInput
        style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor }]}
        placeholder="Device Name"
        placeholderTextColor={theme.textColor}
        value={deviceName}
        onChangeText={setDeviceName}
      />

      <TextInput
        style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor }]}
        placeholder="Device Type"
        placeholderTextColor={theme.textColor}
        value={deviceType}
        onChangeText={setDeviceType}
      />

      <TextInput
        style={[styles.input, { color: theme.textColor, backgroundColor: theme.inputBackgroundColor, borderColor: theme.textColor }]}
        placeholder="Serial Number"
        placeholderTextColor={theme.textColor}
        value={serialNumber}
        onChangeText={setSerialNumber}
      />

      {/* Button to trigger device registration. */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.backgroundColor, borderColor: theme.textColor }]} onPress={addDevice}>
        <Text style={[styles.buttonText, { color: theme.textColor }]}>Add Device</Text>
      </TouchableOpacity>
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    
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
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
},
  input: {
    height: 60, 
    width: '100%', 
    borderWidth: 1,
    padding: 10, 
    borderRadius: 10,
    marginBottom: 20, 
},

  
})

export default DeviceRegistrationScreen;
