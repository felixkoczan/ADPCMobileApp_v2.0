import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import React, { useContext } from 'react';
import ThemeContext from './ThemeContext';
import { useNavigation } from '@react-navigation/native';


const windowHeight = Dimensions.get('window').height;

 const DeviceList = ({peripheral, navigation}) => {
  const {name, rssi, connected} = peripheral;
  const { theme } = useContext(ThemeContext);

// Inside DeviceList component
const handleManagePress = () => {
  // Assume peripheral.id is available here
  const deviceDetails = deviceData.get(peripheral.id); // Correctly access your Map
  if (deviceDetails) {
    navigation.navigate('DeviceDetailsScreen', { device: deviceDetails });
  } else {
    console.log("Device details not found for:", peripheral.id);
  }
};

  
  return (
    <>
      {name && (
        <View style={styles.deviceContainer}>
          <View style={styles.deviceItem}>
            <Text style={[styles.deviceName, { color: theme.buttonTextColor }]}>{name}</Text>
            <Text style={[styles.deviceInfo, { color: theme.buttonTextColor }]}>RSSI: {rssi}</Text>
          </View>
          <TouchableOpacity
            onPress={handleManagePress}
            style={[styles.deviceButton, { backgroundColor: theme.backgroundColor}]}>
            <Text
              style={[
                styles.scanButtonText,
                {fontWeight: 'bold', fontSize: 16},
                { color: theme.buttonTextColor },
              ]}>
              {connected ? 'Disconnect' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: windowHeight,
    paddingHorizontal: 10,
  },
  scrollContainer: {
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
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
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
    marginBottom: 10,
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

export default DeviceList;
