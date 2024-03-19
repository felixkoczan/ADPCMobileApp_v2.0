import React, { useContext, useState, useEffect, createContext, useRef } from 'react';
import { Dimensions, NativeModules, NativeEventEmitter } from 'react-native';
// Import the BleManager module for handling BLE operations.
import BleManager from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { SERVICE_UUID } = require("./constants.js");
const { CHARACTERISTIC_UUID } = require("./constants.js"); 
const windowHeight = Dimensions.get('window').height;
const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const BLEContext = createContext();


export const BLEProvider = ({ children }) => {
  
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const deviceData = useRef(new Map()).current;
  
  // Define a function to start scanning for BLE peripherals.
  const startScan = () => {
    // Request to enable Bluetooth on the device if it's not already enabled.
    // This is a proactive step to ensure Bluetooth is on before starting the scan.
    BleManager.enableBluetooth();
    console.log('attempting:')
  
    // Log to console that the scan attempt is starting. Useful for debugging.
    //console.log("Attempting to start scan...");
  
    // Check if the app is not already scanning to prevent overlapping scans.
    if (!isScanning) {
        // Start scanning for BLE peripherals. The parameters are:
        // - The first array is for specific service UUIDs to scan for; an empty array means scan for all peripherals.
        // - The second parameter (20) is the scan duration in seconds.
        // - The third parameter (true) specifies that the scan should allow duplicates.
        BleManager.scan([], 5, true)
            .then(() => {
                // If the scan successfully starts, log to console and update the isScanning state to true.
                //console.log('Scanning...');
              
                setIsScanning(true);
                
          console.log('scanning:')
            })
            .catch(error => {
                // If there's an error starting the scan, log the error to console.
                console.error(error);
            });
    }
  };

  // Define a function to handle the event when the BLE scan is stopped.
const stopScan = () => {
  // Log a message to the console indicating that the scan has been stopped. Useful for debugging.
  console.log('Scan is stopped');
  // Update the component's state to reflect that the application is no longer scanning for BLE devices.
  setIsScanning(false);
};

const connectToPeripheral = async (peripheral) => {
  try {
    await BleManager.connect(peripheral.id);
    peripheral.connected = true;
    peripherals.set(peripheral.id, peripheral);
    setConnectedDevices(Array.from(peripherals.values()));
    setDiscoveredDevices(Array.from(peripherals.values()));

    await discoverPeripheralServices(peripheral.id);
    const newConsent = await readCharacteristic(peripheral.id);
    console.log('newconsent', newConsent)

    // Fetch existing devices and their consents from AsyncStorage
    const existingDevicesJSON = await AsyncStorage.getItem('@devicesConsents');
    let existingDevices = existingDevicesJSON ? JSON.parse(existingDevicesJSON) : [];

    // Find if the current peripheral is already stored
    const deviceIndex = existingDevices.findIndex(device => device.peripheralId === peripheral.id);
    
    if (deviceIndex !== -1) {
      // Device already exists, check if the consent already exists
      const consentIndex = existingDevices[deviceIndex].consents.findIndex(consent => consent.id === newConsent.id);
      if (consentIndex === -1) {
        // Consent ID does not exist, add new consent to its consents array
        existingDevices[deviceIndex].consents.push(newConsent);
      } else {
        // Consent ID already exists, optionally update it or simply log
        console.log('Consent ID already exists, not adding:', newConsent.id);
        // If you need to update an existing consent, you can do it here
        // existingDevices[deviceIndex].consents[consentIndex] = newConsent;
      }
    } else {
      // Device does not exist, add new device with details and empty consents array
      existingDevices.push({
        peripheralId: peripheral.id,
        deviceName: peripheral.name || 'Unknown Device', // Adjust according to how you get device name
        consents: [newConsent] // Initialize consents array with the new consent
      });
    }
    
    // Save updated array of devices to AsyncStorage
    await AsyncStorage.setItem('@devicesConsents', JSON.stringify(existingDevices));

  } catch (error) {
    console.log('Failed to connect: ', error);
  }
};




  const discoverPeripheralServices = (peripheralId) => {
    BleManager.retrieveServices(peripheralId).then((peripheralInfo) => {
      // Now that services and characteristics have been discovered, you can proceed with reading a characteristic
      readCharacteristic(peripheralId);
    });
  };

  const readCharacteristic = async (peripheralId) => {
    try {
      const readData = await BleManager.read(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID);
      const parsedData = parseDataFromBytes(readData);
      console.log('Parsed Data:', parsedData);
      return parsedData; // Now this will correctly return the parsed data to the caller.
    } catch (error) {
      console.log('Read characteristic error:', error);
      // It's a good idea to rethrow the error or handle it appropriately so the caller can react to it.
      throw error;
    }
  };
  

  const parseDataFromBytes = (data) => {
    let index = 0;
  
    const readStringField = () => {
      if (index >= data.length) return "";
      const length = data[index++]; // Get length as the next byte
      let stringValue = "";
      for (let i = 0; i < length; i++) {
        stringValue += String.fromCharCode(data[index++]);
      }
      return stringValue;
    };
  
    const id = readStringField();
    const deviceName = readStringField();
    const summary = readStringField();
    const purposes = readStringField();
    const processing = readStringField();
    const dataCategory = readStringField();
    const measures = readStringField();
    const legalBases = readStringField();
    const storage = readStringField();
    const scale = readStringField();
    const duration = readStringField(); // Separated from frequency
    const frequency = readStringField(); // Separated from duration
    const location = readStringField();
  
    return {
      id,
      deviceName,
      summary,
      purposes,
      processing,
      dataCategory,
      measures,
      legalBases,
      storage,
      scale,
      duration,
      frequency,
      location,
    };
  };
  
  

    // Define a function to retrieve a list of peripherals (devices) that have been previously bonded (paired) with the host device.
const getConnectedDevices = () => {
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
const discoverPeripheral = (peripheral) => {
  // Log the discovered peripheral for debugging purposes.
  
  
  // Check if the discovered peripheral is not already in our list of peripherals.
  if (!peripherals.has(peripheral.id)) {
    // If it's a new peripheral (not already in the list), log its addition.
   
    
    // Add the newly discovered peripheral to the 'peripherals' map, using its id as the key.
    peripherals.set(peripheral.id, peripheral);
    
    // Update the 'discoveredDevices' state with the current list of peripherals.
    // Convert the 'peripherals' map to an array to be compatible with React state.
    setDiscoveredDevices(Array.from(peripherals.values()));
  }
};


  
// Define a function to handle the event when a connection is successfully established with a BLE peripheral.
const connectPeripheral = ({peripheral, status}) => {
  // Log the connected peripheral information for debugging purposes.
  //console.log('Connected to peripheral:', peripheral);

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
      setTimeout(() => readCharacteristic(peripheral.id), 500);
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
      throw error;
    });
};

  // Define a function to disconnect from a BLE peripheral and remove the bond between the device and the peripheral.
const disconnectFromPeripheral = peripheral => {
  // Attempt to remove the bond with the specified peripheral using its unique identifier.
  BleManager.disconnect(peripheral.id)
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

      console.log("Successfully disconnected from peripheral")
    })
    .catch(() => {
      // If the process to remove the bond fails, log an error message.
      console.log('fail to remove the connection');
    });
};

const deleteConsent = (peripheralId, consentId) => {
  // Extract the short identifier from the consentId, assuming it starts with 'q' followed by a number
  const shortConsentId = consentId.match(/q\d+/)[0]; // This will match 'q1', 'q2', etc.
  const deleteRequestString = `delete:${shortConsentId}`;

  const dataBytes = Array.from(deleteRequestString).map(char => char.charCodeAt(0));

  BleManager.write(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID, dataBytes)
    .then(() => {
      console.log('Delete request sent successfully');
    })
    .catch((error) => {
      console.log('Write characteristic error:', error);
      throw error;
    });
};



  


  const value = {
    deviceData,
    isScanning,
    setIsScanning,
    connectedDevices,
    setConnectedDevices,
    discoveredDevices,
    setDiscoveredDevices,
    startScan,
    connectToPeripheral,
    disconnectFromPeripheral,
    discoverPeripheralServices,
    readCharacteristic,
    stopScan,
    parseDataFromBytes,
    discoverPeripheral,
    getConnectedDevices,
    connectPeripheral,
    writeConsentResponse,
    deleteConsent
  };
  
  return (
    <BLEContext.Provider value={value}>
      {children}
    </BLEContext.Provider>
  );
  
};

export const useBLE = () => useContext(BLEContext);