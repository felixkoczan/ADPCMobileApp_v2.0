// ManageConsentsScreen.js
// Allows the user to manage their consent, as well as simplify the consent received.

import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import ThemeContext from '../ThemeContext';
import { apiCall } from '../apis/OpenAIApi'; 
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';


const ManageConsentsScreen = () => {

  const { theme } = useContext(ThemeContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const containerOpacity = isModalVisible ? 0.5 : 1;
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);


  useFocusEffect(
    useCallback(() => {
      const loadDeviceDetails = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@devicesConsents');
          const devicesConsents = jsonValue != null ? JSON.parse(jsonValue) : [];
          setDevices(devicesConsents);
          setFilteredData(devicesConsents);
          console.log(devicesConsents);
        } catch (e) {
          console.error("Failed to load devices and consents from AsyncStorage", e);
        }
      };
      loadDeviceDetails();
      return () => {
        setSearchQuery('');
      }
    }, [])
  );


  useEffect(() => {
    // Convert the search query to lowercase for case-insensitive comparison.
    const lowercasedQuery = searchQuery.toLowerCase();
    const transformedDevices = devices.map(device => {
      // Check if a device's name matches the search query.
      const isDeviceMatch = device.deviceName.toLowerCase().includes(lowercasedQuery);
      // Filter the consents within each device based on the search query. If the device name matches the query,
      // keep all consents. Otherwise, only keep consents that match the query in any of their properties.
      const filteredConsents = isDeviceMatch
        ? device.consents 
        : device.consents.filter(consent => 
            consent.id.toLowerCase().includes(lowercasedQuery) ||
            consent.dataCategory.toLowerCase().includes(lowercasedQuery) ||
            consent.purposes.toLowerCase().includes(lowercasedQuery) ||
            consent.processing.toLowerCase().includes(lowercasedQuery) ||
            consent.summary.toLowerCase().includes(lowercasedQuery) ||
            consent.measures.toLowerCase().includes(lowercasedQuery) ||
            consent.legalBases.toLowerCase().includes(lowercasedQuery) ||
            consent.storage.toLowerCase().includes(lowercasedQuery) ||
            consent.scale.toLowerCase().includes(lowercasedQuery) ||
            consent.duration.toLowerCase().includes(lowercasedQuery) ||
            consent.frequency.toLowerCase().includes(lowercasedQuery) ||
            consent.location.toLowerCase().includes(lowercasedQuery) 
          );
      // Return a new object for the device, updating the consents array to the filtered list.
      return {
        ...device,
        consents: filteredConsents,
      };
    });
    // Further filter the transformed devices to include only those devices that match the search query
    // in their name or have at least one consent matching the query.
    const filteredDevices = transformedDevices.filter(device =>
      device.deviceName.toLowerCase().includes(lowercasedQuery) || device.consents.length > 0
    );
    // Update the state with the filtered list of devices.
    setFilteredData(filteredDevices);
  }, [searchQuery, devices]); // Re-run the effect if searchQuery or devices change.
  

  // Function to handle the submission action to simplify a device consent.
  const handleSubmit = async (deviceText) => {
    setModalVisible(true); 
    setIsLoading(true); 
    try {
      // Start an API call with the device's consent text.
      const result = await apiCall(deviceText);
      if (result.success) {
        // Update the modal content with the API response if successful.
        setModalContent(result.data);
      } else {
        console.error(result.msg);
        setModalContent("Failed to fetch response.");
      }
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setModalContent("An error occurred while fetching the response.");
    } finally {
      // Reset loading state once the API call is complete.
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor, opacity: containerOpacity }]}>
      <TextInput
        style={[styles.searchBar, { backgroundColor: theme.backgroundColor }]}
        placeholder="Search for a device or consent ..."
        placeholderTextColor={theme.textColor}
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
  
      {filteredData.length > 0 ? (
        filteredData.map((device, deviceIndex) => (
          <View key={deviceIndex} style={[styles.deviceContainer, { backgroundColor: theme.itemBackgroundColor }]}>
            <ScrollView>
              <Text style={[styles.deviceName, { color: theme.textColor }]}>{device.deviceName}</Text>
              {device.consents.map((consent, consentIndex) => (
                <View key={consentIndex} style={styles.consentContainer}>
                  <Text style={[styles.consentHeading, { color: theme.textColor }]}>Consent ID:</Text>
                  <Text style={[styles.consentText, { color: theme.textColor }]}>{consent.id}</Text>
                  <Text style={[styles.consentHeading, { color: theme.textColor }]}>Summary:</Text>
                  <Text style={[styles.consentText, { color: theme.textColor }]}>{consent.summary}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, { borderColor: theme.buttonTextColor }]}
                      onPress={() => {
                        console.log('Navigating to Device Details with:', { 
                          peripheralId: device.peripheralId, 
                          consentId: consent.id 
                        });
                        navigation.navigate('Device Details', { 
                          screen: 'DeviceDetailScreen',  
                          params: {
                            peripheralId: device.peripheralId, 
                            consentId: consent.id
                          },
                        });
                      }}
                    >
                      <Text style={[styles.buttonText, { color: theme.textColor }]}>Manage Consent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, { borderColor: theme.buttonTextColor }]}
                      onPress={() => handleSubmit(consent.summary)} // Adjust if necessary for your use case
                    >
                      <Text style={[styles.buttonText, { color: theme.textColor }]}>Simplify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))
      ) : (
        <View style={styles.noConsentsContainer}>
          <Text style={styles.noConsentsText}>No consents received</Text>
        </View>
      )}
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalView, { backgroundColor: theme.backgroundColor }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color='#05648f' />
          ) : (
            <>
              <View style={styles.responseWithLogo}>
                <Image
                  source={require('../assets/adpc_logo_high.png')} // Make sure this path is correct
                  style={styles.logo}
                />
                <Text style={[styles.responseText, { color: theme.textColor }]}>{modalContent}</Text>
              </View>
              <TouchableOpacity
                style={[styles.buttonClose, { backgroundColor: theme.buttonColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.textColor }]}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );  
};
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  deviceContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  deviceName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  consentText: {
    marginTop: 5,
    fontSize: 14,
    marginLeft: 15,
  },
  consentHeading: {
    marginTop: 15,
  
    marginLeft: 15,
    fontSize: 15,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: '',
    justifyContent: 'space-around'
  },
  responseWithLogo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: 111,
    height: 50,
    marginBottom: 20,
  },
  searchBar: {
    height: 40, 
    margin: 12,
    borderWidth: 1,
    borderColor: '#cccccc', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    color: '#cccccc', 
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noConsentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, 
  },
  noConsentsText: {
    fontSize: 18, 
    color: '#666', 
  },
});

export default ManageConsentsScreen;