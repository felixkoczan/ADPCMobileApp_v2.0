// Import ThemeContext for theming support throughout the application.
import ThemeContext from '../ThemeContext';
// Import necessary React hooks and React Native components.
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, NativeModules, NativeEventEmitter
} from 'react-native';
// Import the BleManager module for handling BLE operations.
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';
import { useBLE } from '../BLEContext.js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { SERVICE_UUID } = require("../constants.js");
const { CHARACTERISTIC_UUID } = require("../constants.js"); 
const windowHeight = Dimensions.get('window').height;


// Access the native BLE manager module and create an event emitter for it.
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Define the DiscoverDevicesScreen functional component.
const DiscoverDevicesScreen = ({peripheral}) => {
  // Initialize a Map to store discovered BLE peripherals.
  // useContext hook to access the current theme from ThemeContext.
  const { theme } = useContext(ThemeContext);
  const deviceData = useRef(new Map()).current;
  const navigation = useNavigation();

  const { connectToPeripheral } = useBLE();
  const { disconnectFromPeripheral } = useBLE();
  const { discoverPeripheralServices } = useBLE();
  const { startScan, isScanning, discoveredDevices
   } = useBLE();
  const { stopScan } = useBLE();
  const { readCharacteristic} = useBLE();
  const { parseDataFromBytes } = useBLE();
  const { discoverPeripheral } = useBLE();
  const { writeConsentResponse } = useBLE();
  const { connectPeripheral } = useBLE();
  const { getConnectedDevices } = useBLE();

// Use the useEffect hook to perform side effects in the component, specifically for initializing the BLE manager.
useEffect(() => {
  // Start the BLE manager with configuration options. Here, 'showAlert' is set to false to prevent automatic alerts.
  BleManager.start({showAlert: false})
    .then(() => {
      // Log success once the BLE manager is successfully initialized.
      console.log('BleManager initialized');
      
      // After initialization, check the current Bluetooth state of the device.
      // This can help determine if Bluetooth is turned on and available for use.
      BleManager.checkState();
    })
    .catch((error) => {
      // If there's an error during the initialization of the BLE manager, log the error.
      console.error('BleManager initialization error:', error);
    });


// After initializing the BLE manager, set up a listener to react to changes in the Bluetooth state of the device.
const bluetoothStateListener = BleManagerEmitter.addListener(
  // The event 'BleManagerDidUpdateState' is emitted whenever there's a change in the Bluetooth state.
  'BleManagerDidUpdateState', 
  ({ state }) => { // The callback function receives an object with the current state of Bluetooth.
    if (state === 'on') {
      // If Bluetooth is turned on, log this information for debugging purposes.
      //console.log('Bluetooth is turned on!');
      // Additionally, fetch the list of already connected (bonded) devices.
      getConnectedDevices();
      startScan();
    } else {
      // If Bluetooth is not turned on (could be 'off', 'resetting', etc.), log the current state.
      console.log('Bluetooth is turned', state);
    }
  }
);

// Listener for the discovery of BLE peripherals. When a peripheral is discovered, handleDiscoverPeripheral is called.
const stopDiscoverListener = BleManagerEmitter.addListener(
  'BleManagerDiscoverPeripheral',
  discoverPeripheral
);

// Listener for successful connection events to BLE peripherals. When a peripheral is connected, handleConnectPeripheral is called.
const stopConnectListener = BleManagerEmitter.addListener(
  'BleManagerConnectPeripheral',
  connectPeripheral
);

// Listener for the event when BLE scanning has stopped. When the scan stops, handleStopScan is called.
const stopScanListener = BleManagerEmitter.addListener(
  'BleManagerStopScan',
  stopScan
);
  
// Define a cleanup function that will be executed when the component unmounts or when the effect re-runs (which, in this case, won't happen because the dependency array is empty, indicating the effect only runs on mount).

return () => {
  // Remove the 'BleManagerDiscoverPeripheral' event listener to prevent memory leaks and ensure the app doesn't continue to respond to this event after the component has unmounted or the effect has been cleaned up.
  stopDiscoverListener.remove();

  // Remove the 'BleManagerConnectPeripheral' event listener for similar reasons, ensuring the app doesn't react to peripheral connection events after cleanup.
  stopConnectListener.remove();

  // Remove the 'BleManagerStopScan' event listener to stop handling BLE scan stop events after the component has unmounted or in preparation for the effect to be re-run.
  stopScanListener.remove();
};
  }, []);

const renderDeviceItem = (item) => (
  <View style={styles.deviceContainer}>
    <View style={styles.deviceItem}>
      <Text style={[styles.deviceName, {color: theme.buttonTextColor}]}>{item.name}</Text>
      <Text style={[styles.deviceInfo, {color: theme.buttonTextColor}]}>RSSI: {item.rssi}</Text>
    </View>
    <TouchableOpacity
  onPress={() => {
    // Execute connect or disconnect based on the item's connected status
    if (item.connected) {
      disconnectFromPeripheral(item);
    } else {
      connectToPeripheral(item).then(() => {
        // Assuming connectToPeripheral is asynchronous and returns a Promise
        // You might need to adjust this based on your actual implementation
        // If connectToPeripheral does not return a Promise, you can directly use setTimeout without .then()

        // Wait for a bit before navigating
        setTimeout(() => {
          navigation.navigate('Manage Consents'); // Ensure to pass any required params
        }, 500);
      }).catch(error => {
        console.error("Connection error:", error);
      });
    }
  }}
>
      <Text
        style={[
          styles.scanButtonText,
          {fontWeight: 'bold', fontSize: 16},
          {color: theme.buttonTextColor},
        ]}>
        {item.connected ? 'Disconnect' : 'Connect'}
      </Text>
    </TouchableOpacity>
  </View>
);


return (
  <FlatList
  style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    data={discoveredDevices.length > 0 ? discoveredDevices : [{}]} // Ensures the FlatList still renders header/footer with empty data
    renderItem={({ item, index }) =>
      discoveredDevices.length === 0 ? null : renderDeviceItem(item)
    }
    keyExtractor={(item, index) => item.id || index.toString()}
    ListHeaderComponent={
      <>
        <Text style={[styles.title, { color: theme.buttonTextColor }]}>
          Discovered Devices
        </Text>
        {discoveredDevices.length === 0 && (
          <Text style={[styles.contentText, { color: theme.buttonTextColor }]}>
            No devices found
          </Text>
        )}
      </>
    }
    ListFooterComponent={
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={[styles.discoverButton, { backgroundColor: theme.backgroundColor, borderColor: theme.textColor }]}
          onPress={startScan}>
          <Text style={[styles.buttonText, { color: theme.textColor }]}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Text>
        </TouchableOpacity>
      </View>
    }
    // This prop is necessary to ensure the FlatList does not become unscrollable when data is empty
    ListEmptyComponent={<></>}
  />
);
};

styles = StyleSheet.create({
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
  container: {
    flex: 1,
    padding: 10, 
    alignItems: 'center', 
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
},
  contentText: {
    fontSize: 16,
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
    container: {
      flex: 1,
      height: windowHeight,
      paddingHorizontal: 10,
    },
    listContainer: {
      padding: 16,
    },
    title: {
      fontSize: 30,
      textAlign: 'center',
      marginBottom: 20,
      marginTop: 40,
    },
    subtitle: {
      fontSize: 24,
      marginBottom: 10,
      marginTop: 20,
    },
    scanButtonText: {
      color: 'white',
      textAlign: 'center',
    },
    noDevicesText: {
      textAlign: 'center',
      marginTop: 10,
      fontStyle: 'italic',
    },
    deviceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 10,
      marginRight: 10,
    },
    deviceItem: {
      marginBottom: 10,
    },
    deviceName: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    deviceInfo: {
      fontSize: 14,
    },
    deviceButton: {
      backgroundColor: "red",
      padding: 8,
      borderRadius: 5,
      marginBottom: 20,
      marginLeft: 20,
      paddingHorizontal: 20,
    },
  });

export default DiscoverDevicesScreen;
