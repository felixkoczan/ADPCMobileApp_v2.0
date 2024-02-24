// Import ThemeContext for theming support throughout the application.
import ThemeContext from '../ThemeContext';
// Import necessary React hooks and React Native components.
import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Alert,
  StyleSheet, Dimensions, SafeAreaView, StatusBar, NativeModules, NativeEventEmitter
} from 'react-native';
// Import the BleManager module for handling BLE operations.
import BleManager from 'react-native-ble-manager';
// Use the useNavigation hook from React Navigation for programmatically navigating between screens.
import { useNavigation } from '@react-navigation/native';

// Access the native BLE manager module and create an event emitter for it.
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Define the DiscoverDevicesScreen functional component.
const DiscoverDevicesScreen = () => {
  // Initialize a Map to store discovered BLE peripherals.
  const peripherals = new Map();
  // useState hooks to manage component state.
  const [isScanning, setIsScanning] = useState(false); // Tracks if the app is currently scanning for BLE devices.
  const [connectedDevices, setConnectedDevices] = useState([]); // Stores devices that have been connected.
  const [discoveredDevices, setDiscoveredDevices] = useState([]); // Stores devices that have been discovered during the scan.
  // useContext hook to access the current theme from ThemeContext.
  const { theme } = useContext(ThemeContext);


  
  
  // Define a function to retrieve a list of peripherals (devices) that have been previously bonded (paired) with the host device.
const handleGetConnectedDevices = () => {
  // Use the BleManager to fetch bonded peripherals. The empty array argument indicates no specific filtering by service IDs.
  BleManager.getBondedPeripherals([]).then(results => {
    // Iterate through each bonded peripheral returned by the BleManager.
    for (let i = 0; i < results.length; i++) {
      let peripheral = results[i]; // Store the current peripheral in a variable for easier access.
      peripheral.connected = true; // Add a 'connected' property to the peripheral object and set it to true.
      peripherals.set(peripheral.id, peripheral); // Update the peripherals map with the peripheral, using its id as the key.
      setConnectedDevices(Array.from(peripherals.values())); // Convert the peripherals map to an array and update the connectedDevices state.
    }
  });
};


// Define a function to handle the discovery of a new peripheral (device) during a BLE scan.
const handleDiscoverPeripheral = (peripheral) => {
  // Log the discovered peripheral for debugging purposes.
  console.log('Discovered a new peripheral:', peripheral);
  
  // Check if the discovered peripheral is not already in our list of peripherals.
  if (!peripherals.has(peripheral.id)) {
    // If it's a new peripheral (not already in the list), log its addition.
    console.log('Adding to state:', peripheral);
    
    // Add the newly discovered peripheral to the 'peripherals' map, using its id as the key.
    peripherals.set(peripheral.id, peripheral);
    
    // Update the 'discoveredDevices' state with the current list of peripherals.
    // Convert the 'peripherals' map to an array to be compatible with React state.
    setDiscoveredDevices(Array.from(peripherals.values()));
  }
};

  
  
// Define a function to handle the event when the BLE scan is stopped.
const handleStopScan = () => {
  // Log a message to the console indicating that the scan has been stopped. Useful for debugging.
  console.log('Scan is stopped');
  // Update the component's state to reflect that the application is no longer scanning for BLE devices.
  setIsScanning(false);
};



// Define a function to handle reading a specific characteristic from a BLE peripheral.
const handleReadCharacteristic = (peripheralId) => {
  // Initiate a read operation on the specified peripheral, service, and characteristic.
  // SERVICE_UUID and CHARACTERISTIC_UUID need to be predefined constants or variables that specify which service and characteristic to read.
  BleManager.read(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID)
    .then((readData) => {
      // The read operation returns data as an array of bytes.

      // Log the raw data read from the characteristic for debugging purposes.
      console.log('Read data:', readData);

      // Parse the raw data into a more readable or usable format, assuming parseDataFromBytes is a custom function designed for this purpose.
      const parsedData = parseDataFromBytes(readData);
      // Log the parsed data to the console for verification or debugging.
      console.log('Parsed Data:', parsedData);

      // Here, you could potentially update the component's state with the parsed data to display it in the UI or use it elsewhere in the application.
    })
    .catch((error) => {
      // If there's an error during the read operation, log it to the console.
      console.log('Read characteristic error:', error);
    });
};

  
// Define a function to handle the event when a connection is successfully established with a BLE peripheral.
const handleConnectPeripheral = ({peripheral, status}) => {
  // Log the connected peripheral information for debugging purposes.
  console.log('Connected to peripheral:', peripheral);

  // Check if the connected peripheral is already tracked in the peripherals map.
  if (peripherals.has(peripheral.id)) {
      // Retrieve the existing peripheral data and update its 'connected' status to true.
      const updatedPeripheral = {...peripherals.get(peripheral.id), connected: true};
      // Update the peripherals map with the newly updated peripheral data.
      peripherals.set(peripheral.id, updatedPeripheral);
      // Update the connectedDevices state with the latest peripherals data, converting the map values to an array.
      setConnectedDevices(Array.from(peripherals.values()));

      // Initiate a read operation on the characteristic of the connected peripheral after a short delay.
      // The delay ensures that the connection is fully established before attempting to read.
      setTimeout(() => handleReadCharacteristic(peripheral.id), 500);
  }
};

  
// Define a function to write a user's consent response back to a BLE peripheral.
const writeConsentResponse = (peripheralId, acceptedConsentIds) => {
  // Assuming `acceptedConsentIds` is an array of consent IDs the user agreed to, e.g., ['id1', 'id2', ...].
  // First, concatenate the consent IDs into a single string separated by semicolons.
  const dataString = acceptedConsentIds.join(';'); // This creates a string like 'id1;id2;id3'.
  
  // Convert the concatenated string into an array of bytes.
  // This is necessary because BLE write operations deal with data at the byte level.
  const dataBytes = Array.from(dataString).map(char => char.charCodeAt(0)); // Convert each character to its ASCII byte representation.
  
  // Perform the write operation using BleManager to send the consent response to the peripheral.
  BleManager.write(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID, dataBytes)
    .then(() => {
      // Log a success message if the write operation completes without errors.
      console.log('Wrote consent response successfully');
    })
    .catch((error) => {
      // If the write operation fails, log the encountered error.
      console.log('Write characteristic error:', error);
    });
};


  
// Define a function to handle the user's response to a consent request for a BLE peripheral.
const handleConsentResponse = (peripheralId, consentId, isAccepted) => {
  // Check if the user accepted the consent request.
  if (isAccepted) {
      // If consent was accepted, proceed to write the consent response back to the peripheral.
      // The consentId is wrapped in an array since the writeConsentResponse function expects an array of IDs.
      writeConsentResponse(peripheralId, [consentId]);
  } else {
      // If the consent was declined, log this event.
      // This could be expanded to include additional handling for declined consents,
      // such as notifying the user or the peripheral that consent was not given.
      console.log('Consent declined:', consentId);
  }
};


  
// Define a function to parse data received from a BLE device, where data is expected to be in byte format.
const parseDataFromBytes = (data) => {
  let index = 0; // Initialize an index to keep track of the current position in the data array.

  // Define a helper function to read a string field from the data array. This function assumes
  // the first byte represents the length of the string, followed by the string's characters.
  const readStringField = () => {
    const length = data[index]; // Retrieve the length of the string from the current index.
    index += 1; // Increment the index to move past the length byte.
    
    // Use String.fromCharCode.apply to convert the array of character codes into a string.
    // data.slice is used to get the array of bytes that represent the string, based on the length.
    const stringValue = String.fromCharCode.apply(null, data.slice(index, index + length));
    
    index += length; // Move the index past the string to the next piece of data.
    return stringValue; // Return the parsed string.
  };

  // Use the helper function to parse each field from the data array in the predefined order.
  // These fields represent the structured data extracted from the BLE device.
  const id = readStringField(); // Parse the ID field.
  const deviceName = readStringField(); // Parse the device name field.
  const text = readStringField(); // Parse the text field.
  const collectedData = readStringField(); // Parse the collected data field.
  const purpose = readStringField(); // Parse the purpose field.

  // Construct and return an object with the parsed data fields.
  return {
    id,
    deviceName,
    text,
    collectedData,
    purpose
  };
};
  

  
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
      console.log('Bluetooth is turned on!');
      // Additionally, fetch the list of already connected (bonded) devices.
      handleGetConnectedDevices();
    } else {
      // If Bluetooth is not turned on (could be 'off', 'resetting', etc.), log the current state.
      console.log('Bluetooth is turned', state);
    }
  }
);

// This listener is part of the component's setup procedure and ensures that the app responds
// appropriately to changes in the device's Bluetooth state, such as fetching connected devices
// when Bluetooth is enabled or logging state changes for debugging and user information purposes.


  
// Set up listeners for various BLE events using the BleManagerEmitter. Each listener is associated with a specific event and handler function.

// Listener for the discovery of BLE peripherals. When a peripheral is discovered, handleDiscoverPeripheral is called.
const stopDiscoverListener = BleManagerEmitter.addListener(
  'BleManagerDiscoverPeripheral',
  handleDiscoverPeripheral
);

// Listener for successful connection events to BLE peripherals. When a peripheral is connected, handleConnectPeripheral is called.
const stopConnectListener = BleManagerEmitter.addListener(
  'BleManagerConnectPeripheral',
  handleConnectPeripheral
);

// Listener for the event when BLE scanning has stopped. When the scan stops, handleStopScan is called.
const stopScanListener = BleManagerEmitter.addListener(
  'BleManagerStopScan',
  handleStopScan
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
  


// Define a function to start scanning for BLE peripherals.
const startScan = () => {
  // Request to enable Bluetooth on the device if it's not already enabled.
  // This is a proactive step to ensure Bluetooth is on before starting the scan.
  BleManager.enableBluetooth();

  // Log to console that the scan attempt is starting. Useful for debugging.
  console.log("Attempting to start scan...");

  // Check if the app is not already scanning to prevent overlapping scans.
  if (!isScanning) {
      // Start scanning for BLE peripherals. The parameters are:
      // - The first array is for specific service UUIDs to scan for; an empty array means scan for all peripherals.
      // - The second parameter (20) is the scan duration in seconds.
      // - The third parameter (true) specifies that the scan should allow duplicates.
      BleManager.scan([], 20, true)
          .then(() => {
              // If the scan successfully starts, log to console and update the isScanning state to true.
              console.log('Scanning...');
              setIsScanning(true);
          })
          .catch(error => {
              // If there's an error starting the scan, log the error to console.
              console.error(error);
          });
  }
};


// Define a function to pair (create a bond) with a BLE peripheral before establishing a connection.
const connectToPeripheral = peripheral => {
  // Attempt to create a bond with the specified peripheral using its unique identifier.
  BleManager.createBond(peripheral.id)
    .then(() => {
      // If the bond is successfully created, update the peripheral's connected status.
      peripheral.connected = true;

      // Add or update the peripheral's information in the peripherals map to reflect the new bond.
      peripherals.set(peripheral.id, peripheral);

      // Update the 'connectedDevices' state with the latest list of peripherals from the map.
      // This reflects the newly bonded peripheral in the app's UI or logic.
      setConnectedDevices(Array.from(peripherals.values()));

      // Similarly, update the 'discoveredDevices' state, which may also display this peripheral.
      setDiscoveredDevices(Array.from(peripherals.values()));

      // Log a success message indicating the peripheral has been successfully paired.
      console.log('BLE device paired successfully');
    })
    .catch(() => {
      // If the bonding process fails, log an error message.
      console.log('failed to bond');
    });
};


// Define a function to disconnect from a BLE peripheral and remove the bond between the device and the peripheral.
const disconnectFromPeripheral = peripheral => {
  // Attempt to remove the bond with the specified peripheral using its unique identifier.
  BleManager.removeBond(peripheral.id)
    .then(() => {
      // If the bond is successfully removed, update the peripheral's connected status to false.
      peripheral.connected = false;

      // Update the peripheral's information in the peripherals map to reflect the disconnection.
      peripherals.set(peripheral.id, peripheral);

      // Update the 'connectedDevices' state with the latest list of peripherals from the map,
      // reflecting the disconnection in the app's UI or logic.
      setConnectedDevices(Array.from(peripherals.values()));

      // Similarly, update the 'discoveredDevices' state, which may also display this peripheral.
      setDiscoveredDevices(Array.from(peripherals.values()));

      // Display an alert to inform the user that the device has been successfully disconnected.
      Alert.alert(`Disconnected from ${peripheral.name}`);
    })
    .catch(() => {
      // If the process to remove the bond fails, log an error message.
      console.log('fail to remove the bond');
    });
};


    return (
      <View style={[styles.container, {backgroundColor: theme.backgroundColor}]}>

      <Text
        style={[styles.title, { color: theme.buttonTextColor }]}>
        Discovered Devices
      </Text>
      {discoveredDevices.length > 0 ? (
        <FlatList
          data={discoveredDevices}
          renderItem={({item}) => (
            <DeviceList
              peripheral={item}
              connect={connectToPeripheral}
              disconnect={disconnectFromPeripheral}
            />
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={[styles.contentText, { color: theme.buttonTextColor }]}>No devices found</Text>
      )}
      <View style={styles.buttonContainer}>
      <TouchableOpacity
        activeOpacity={0.5}
        style={[styles.discoverButton, { backgroundColor: theme.buttonTextColor }]}
        onPress={startScan}>
        <Text style={[styles.buttonText, { color: theme.backgroundColor }]}>
          {isScanning ? 'Scanning...' : 'Scan for Devices'}
        </Text>
      </TouchableOpacity>
      </View>
      </View>
    );
};

styles = StyleSheet.create({
  discoverButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'stretch', 
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '60%',
  },
  container: {
    flex: 1,
    padding: 10, 
    alignItems: 'center', 
  },
  buttonContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center', 
    alignItems: 'stretch', 
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
  },
})

export default DiscoverDevicesScreen;
