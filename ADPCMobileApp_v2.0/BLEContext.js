import React, {useState, useEffect, createContext, useCallback, useContext} from 'react';
import {
  Text,
  Alert,
  View,
  FlatList,
  StatusBar,
  SafeAreaView,
  NativeModules,
  useColorScheme,
  TouchableOpacity,
  NativeEventEmitter,
  StyleSheet,
  Dimensions,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {DeviceList} from './DeviceList';


const windowHeight = Dimensions.get('window').height;


const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const BLEContext = createContext();
export const useBLE = () => useContext(BLEContext);

export const BLEProvider = ({ children }) => {
  
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  
  
  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals([]).then(results => {
      for (let i = 0; i < results.length; i++) {
        let peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      }
    });
  };

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Discovered a new peripheral:', peripheral);
    if (!peripherals.has(peripheral.id)) {
      console.log('Adding to state:', peripheral);
      peripherals.set(peripheral.id, peripheral);
      setDiscoveredDevices(Array.from(peripherals.values()));
    }
  };
  
  const handleConnectPeripheral = ({peripheral, status}) => {
    console.log('Connected to peripheral:', peripheral);
    // Update the connected status of the peripheral in your state
    if (peripherals.has(peripheral.id)) {
      const updatedPeripheral = {...peripherals.get(peripheral.id), connected: true};
      peripherals.set(peripheral.id, updatedPeripheral);
      setConnectedDevices(Array.from(peripherals.values()));
    }
  };
  
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  

  useEffect(() => {
    // Initial BLE setup
    BleManager.start({showAlert: false})
    .then(() => {
      console.log('BleManager initialized');
      // Check if Bluetooth is already enabled
      BleManager.checkState();
    })
    .catch((error) => {
      console.error('BleManager initialization error:', error);
    });

  // Listen for Bluetooth state changes
  const bluetoothStateListener = BleManagerEmitter.addListener('BleManagerDidUpdateState', ({ state }) => {
    if (state === 'on') {
      console.log('Bluetooth is turned on!');
      handleGetConnectedDevices();
    } else {
      // Bluetooth is not turned on
      console.log('Bluetooth is turned', state);
    }
  });
  

  
    const stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral
    );
    const stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      handleConnectPeripheral
    );
    const stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      handleStopScan
    );
  
    // Cleanup
    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);
  


  const startScan = () => {
    BleManager.enableBluetooth();
    console.log("Attempting to start scan...");
    if (!isScanning) {
      BleManager.scan([], 20, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  // pair with device first before connecting to it
  const connectToPeripheral = peripheral => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
        console.log('BLE device paired successfully');
      })
      .catch(() => {
        console.log('failed to bond');
      });
  };
  // disconnect from device
  const disconnectFromPeripheral = peripheral => {
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        console.log('fail to remove the bond');
      });
  };
  
  // render list of bluetooth devices
  return (
    <BLEContext.Provider value={{ discoveredDevices, connectedDevices , isScanning, startScan, connectToPeripheral, disconnectFromPeripheral }}>
        {children}
    </BLEContext.Provider>
);
};