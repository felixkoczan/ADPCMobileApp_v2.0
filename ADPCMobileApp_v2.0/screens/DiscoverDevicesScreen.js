// DiscoverDevicesScreen.js
// Enables the user to discover nearby Bluetooth devices to retrieve consent from.
import ThemeContext from '../ThemeContext';
import React, { useContext, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, NativeModules, NativeEventEmitter
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { useNavigation } from '@react-navigation/native';
import { useBLE } from '../BLEContext.js';

const windowHeight = Dimensions.get('window').height;
// Access the native BLE manager module and create an event emitter for it.
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const DiscoverDevicesScreen = ({peripheral}) => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const {
    connectToPeripheral,
    disconnectFromPeripheral,
    startScan,
    isScanning,
    discoveredDevices,
    stopScan,
    discoverPeripheral,
    connectPeripheral,
    getConnectedDevices
  } = useBLE();  


useEffect(() => {
  // Start the BLE manager with configuration options. Here, 'showAlert' is set to false to prevent automatic alerts.
  BleManager.start({showAlert: false})
    .then(() => {
      console.log('BleManager initialized');
      // After initialization, check the current Bluetooth state of the device.
      BleManager.checkState();
    })
    .catch((error) => {
      console.error('BleManager initialization error:', error);
    });

// After initializing the BLE manager, set up a listener to react to changes in the Bluetooth state of the device.
const bluetoothStateListener = BleManagerEmitter.addListener(
  // The event 'BleManagerDidUpdateState' is emitted whenever there's a change in the Bluetooth state.
  'BleManagerDidUpdateState', 
  ({ state }) => { // The callback function receives an object with the current state of Bluetooth.
    if (state === 'on') {
      getConnectedDevices();
      startScan();
    } else {
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
  
// Define a cleanup function that will be executed when the component unmounts.
return () => {
  // Remove the 'BleManagerDiscoverPeripheral' event listener to prevent memory leaks and ensure the app doesn't continue to respond to this event after the component has unmounted or the effect has been cleaned up.
  stopDiscoverListener.remove();
  // Remove the 'BleManagerConnectPeripheral' event listener for similar reasons, ensuring the app doesn't react to peripheral connection events after cleanup.
  stopConnectListener.remove();
  // Remove the 'BleManagerStopScan' event listener to stop handling BLE scan stop events after the component has unmounted or in preparation for the effect to be re-run.
  stopScanListener.remove();
};
  }, []);

  // function to render the discovered devices
  const renderDeviceItem = (item) => (
    <View style={styles.deviceContainer}>
      <View style={styles.deviceItem}>
        <Text style={[styles.deviceName, {color: theme.buttonTextColor}]}>{item.name}</Text>
        <Text style={[styles.deviceInfo, {color: theme.buttonTextColor}]}>RSSI: {item.rssi}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          if (item.connected) {
            disconnectFromPeripheral(item);
          } else {
            connectToPeripheral(item).then(() => {
              setTimeout(() => {
                navigation.navigate('Manage Consents');
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
            {fontWeight: 'bold', fontSize: 16, color: theme.buttonTextColor},
          ]}
        >
          {item.connected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      data={discoveredDevices.length > 0 ? discoveredDevices : [{}]}
      renderItem={({ item }) =>
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
            onPress={startScan}
          >
            <Text style={[styles.buttonText, { color: theme.textColor }]}>
              {isScanning ? 'Scanning...' : 'Scan for Devices'}
            </Text>
          </TouchableOpacity>
        </View>
      }
      ListEmptyComponent={<></>} // ensure List still renders, even if empty.
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