// BLEContext.js
// contains all BLE functionality for use inside the app

// Core imports from React including hooks and context creation function.
import React, { useContext, useState, createContext, useRef } from 'react';
// BleManager for Bluetooth Low Energy (BLE) operations.
import BleManager from 'react-native-ble-manager';
// AsyncStorage for local storage.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importing constants for service and characteristic UUIDs.
const { SERVICE_UUID, CHARACTERISTIC_UUID } = require("./constants.js"); 

const BLEContext = createContext();

// BLEProvider is a component that provides BLE-related data and functions to its children.
export const BLEProvider = ({ children }) => {
  // A Map to store information about detected peripherals.
  const peripherals = new Map();
  // State hooks for managing scanning state, connected devices, and discovered devices.
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  // Using useRef to persist data about devices without causing re-renders.
  const deviceData = useRef(new Map()).current;
  
  // Function to start scanning for BLE peripherals.
  const startScan = () => {
    // Ensure Bluetooth is enabled on the device.
    BleManager.enableBluetooth();
    
    // Only start scanning if not already scanning to avoid overlaps.
    if (!isScanning) {
      BleManager.scan([], 5, true).then(() => {
        setIsScanning(true);
      }).catch(error => {
        console.error(error);
      });
    }
  };

  // Function to stop the BLE scan.
  const stopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  // Function to initiate a connection to a peripheral.
  const connectToPeripheral = async (peripheral) => {
    try {
      // Connect to the peripheral using its ID.
      await BleManager.connect(peripheral.id);
      // Update peripheral data and state after successful connection.
      peripheral.connected = true;
      peripherals.set(peripheral.id, peripheral);
      setConnectedDevices(Array.from(peripherals.values()));
      setDiscoveredDevices(Array.from(peripherals.values()));

      // call discoverPeripheralServices and readCharacteristic on the given peripheral
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
          // Consent ID already exists
          console.log('Consent ID already exists, not adding:', newConsent.id);
        }
      } else {
        // Device does not exist, add new device with details and empty consents array
        existingDevices.push({
          peripheralId: peripheral.id,
          deviceName: peripheral.name || 'Unknown Device', 
          consents: [newConsent] 
        });
      }
      
      // Save updated array of devices to AsyncStorage
      await AsyncStorage.setItem('@devicesConsents', JSON.stringify(existingDevices));
    } catch (error) {
      console.log('Failed to connect: ', error);
    }
  };

  // Function to discover services of a connected peripheral.
  const discoverPeripheralServices = (peripheralId) => {
    BleManager.retrieveServices(peripheralId).then((peripheralInfo) => {
      readCharacteristic(peripheralId);
    });
  };

  // Function to read data from a characteristic.
  const readCharacteristic = async (peripheralId) => {
    try {
      // Read the specified characteristic.
      const readData = await BleManager.read(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID);
      // Parse the read data into a meaningful format, by calling parseDataFromBytes.
      const parsedData = parseDataFromBytes(readData);
      console.log('Parsed Data:', parsedData);
      return parsedData; 
    } catch (error) {
      console.log('Read characteristic error:', error);
      throw error;
    }
  };
  
  // Function to parse byte data from the IoT-device into strings
  const parseDataFromBytes = (data) => {
    let index = 0;
    // Define a helper function to read a string field from the data array.
    const readStringField = () => {
      if (index >= data.length) return "";
      const length = data[index++]; 
      let stringValue = "";
      for (let i = 0; i < length; i++) {
         // Convert each byte into a character using String.fromCharCode,
        // which interprets the byte value as a Unicode code point.
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
    const duration = readStringField(); 
    const frequency = readStringField(); 
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
    BleManager.getBondedPeripherals([]).then(results => {
      for (let i = 0; i < results.length; i++) {
        let peripheral = results[i]; 
        peripheral.connected = true; 
        peripherals.set(peripheral.id, peripheral); 
        setConnectedDevices(Array.from(peripherals.values())); 
      }
    });
  };

  // Define a function to handle the discovery of a new peripheral (device) during a BLE scan.
  const discoverPeripheral = (peripheral) => {
    // Check if the discovered peripheral is not already in our list of peripherals.
    if (!peripherals.has(peripheral.id)) {
      // Add the newly discovered peripheral to the 'peripherals' map, using its id as the key.
      peripherals.set(peripheral.id, peripheral);
      // Update the 'discoveredDevices' state with the current list of peripherals.
      // Convert the 'peripherals' map to an array to be compatible with React state.
      setDiscoveredDevices(Array.from(peripherals.values()));
    }
  };
 
  // Define a function to handle the event when a connection is successfully established with a BLE peripheral.
  const connectPeripheral = ({peripheral, status}) => {
    // Check if the connected peripheral is already tracked in the peripherals map.
    if (peripherals.has(peripheral.id)) {
        // Retrieve the existing peripheral data and update its 'connected' status to true.
        const updatedPeripheral = {...peripherals.get(peripheral.id), connected: true};
        peripherals.set(peripheral.id, updatedPeripheral);
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
    const dataBytes = Array.from(dataString).map(char => char.charCodeAt(0));
    // Perform the write operation using BleManager to send the consent response to the peripheral.
    BleManager.write(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID, dataBytes)
      .then(() => {
        console.log('Wrote consent response successfully');
      })
      .catch((error) => {
        console.log('Write characteristic error:', error);
        throw error;
      });
  };

  // Define a function to disconnect from a BLE peripheral and remove the bond between the device and the peripheral.
  const disconnectFromPeripheral = peripheral => {
    BleManager.disconnect(peripheral.id)
      .then(() => {
        // If the bond is successfully removed, update the peripheral's connected status to false.
        peripheral.connected = false;
        // Update the peripheral's information in the peripherals map to reflect the disconnection.
        peripherals.set(peripheral.id, peripheral);
        // Update the 'connectedDevices' state with the latest list of peripherals from the map
        setConnectedDevices(Array.from(peripherals.values()));
        // Similarly, update the 'discoveredDevices' state, which may also display this peripheral.
        setDiscoveredDevices(Array.from(peripherals.values()));
        console.log("Successfully disconnected from peripheral")
      })
      .catch(() => {
        console.log('fail to remove the connection');
      });
  };

  const deleteConsent = (peripheralId, consentId) => {
    // The consentId is expected to start with 'q' followed by a sequence of numbers (e.g., 'q1', 'q2').
    // This line uses a regular expression to find such patterns within the consentId.
    // The match method returns an array of all matches, and [0] accesses the first match.
    const shortConsentId = consentId.match(/q\d+/)[0]; 
    // A delete request string is constructed by prefixing the extracted shortConsentId with "delete:".
    const deleteRequestString = `delete:${shortConsentId}`;
    const dataBytes = Array.from(deleteRequestString).map(char => char.charCodeAt(0));
    // Using BleManager's write method to send the command to the peripheral.
    BleManager.write(peripheralId, SERVICE_UUID, CHARACTERISTIC_UUID, dataBytes)
      .then(() => {
        console.log('Delete request sent successfully');
      })
      .catch((error) => {
        console.log('Write characteristic error:', error);
        throw error;
      });
};

  // The value object contains all the data and functions to be provided through the context.
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
  
  // The BLEContext.Provider component passes the value object to its children, making the data and functions accessible.
  return (
    <BLEContext.Provider value={value}>
      {children}
    </BLEContext.Provider>
  );
  
};

// Custom hook to provide an easy way for components to access the BLE context.
export const useBLE = () => useContext(BLEContext);