// DeviceDetailsScreen.js
// This screen presents the user the details for the consent they click on.
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import ThemeContext from '../ThemeContext';
import { useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import { useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBLE } from '../BLEContext';


const DeviceDetailScreen = () => {
  const [consentDetails, setConsentDetails] = useState('');
  const route = useRoute();
  const { peripheralId, consentId } = route.params;
  console.log("Received parameters:", { peripheralId, consentId });
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  // State hook for controlling the visibility of the modal dialog (pop-up).
  const [isModalVisible, setModalVisible] = useState(false);
  // Dynamically setting the container opacity based on modal visibility.
  const [ containerOpacity, setContainerOpacity] = useState(1);
  const { writeConsentResponse } = useBLE();
  const { deleteConsent } = useBLE();
  const acceptedConsentIds = [];
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  // called everytime the user navigates to the screen
  useFocusEffect(
    useCallback(() => {
      const loadConsentDetails = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@devicesConsents');
          // Parse the retrieved JSON string into an array of devices, or default to an empty array if null.
          const devices = jsonValue != null ? JSON.parse(jsonValue) : [];
          console.log('devices: ', devices);
          console.log('periph: ', peripheralId);
          console.log('cons: ', consentId);
          // Find the device matching the provided peripheralId.
          const device = devices.find(d => d.peripheralId === peripheralId);
          console.log('device ', device);
          // If the device is found, search for the consent matching the provided consentId within this device's consents.
          if (device) {
            const consent = device.consents.find(c => c.id === consentId);
            // If the matching consent is found, update the state with the consent details.
            if (consent) {
              setConsentDetails(consent);
              console.log('consentdetails', consentDetails);
            }
          }
        } catch (e) {
          console.error("Failed to load consent details from AsyncStorage", e);
        }
      };
      // Call the function to load consent details.
      loadConsentDetails();
    }, [peripheralId, consentId]) // Only re-run the effect if peripheralId or consentId changes.
  );

  // Function to give Consent and call writeConsentResponse from BLEContext.js
  const handleGiveConsent = () => {
    acceptedConsentIds.push(consentDetails.id);
    console.log('accepted', acceptedConsentIds);
    if (peripheralId && acceptedConsentIds.length > 0) {
      writeConsentResponse(peripheralId, acceptedConsentIds)
          setSuccessModalVisible(true); 
          setContainerOpacity(0.5);
          setTimeout(() => {
            setSuccessModalVisible(false);
            setContainerOpacity(1);
            navigation.navigate('Manage Consents'); 
          }, 2000); 
    } else {
      console.log("Peripheral ID or Consent IDs missing");
    }
  };

  // Function to delete consent from async storage and call deleteConsent from BLEContext.js
  const handleDeleteConsent = async () => {
    console.log('Deleting consent', consentDetails.id);
  
    try {
      // Fetch the current list of devices and their consents from AsyncStorage
      const jsonValue = await AsyncStorage.getItem('@devicesConsents');
      let devices = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Find the device and remove the consent from its list
      const deviceIndex = devices.findIndex(device => device.peripheralId === peripheralId);
      if (deviceIndex !== -1) {
        // Remove the consent from the device's consents list
        const updatedConsents = devices[deviceIndex].consents.filter(consent => consent.id !== consentDetails.id);
        
        if (updatedConsents.length > 0) {
          // If there are still consents left, update the device's consents
          devices[deviceIndex].consents = updatedConsents;
        } else {
          // If no consents are left, remove the device from the list
          devices.splice(deviceIndex, 1);
          console.log('Device removed due to no remaining consents');
        }
  
        // Save the updated list back to AsyncStorage
        await AsyncStorage.setItem('@devicesConsents', JSON.stringify(devices));
        deleteConsent(peripheralId, consentDetails.id); 
        console.log('Consent deleted successfully');

        setDeleteModalVisible(true);
        setModalVisible(false);
        setContainerOpacity(0.5);
        
        setTimeout(() => {
          setDeleteModalVisible(false);
          setContainerOpacity(1); // Reset modal visibility
          navigation.navigate('Manage Consents'); // Navigate back
        }, 2000);
      }
    } catch (error) {
      console.error("Error deleting consent from AsyncStorage", error);
    }
  };
  

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor, opacity: containerOpacity }]}>
      <ScrollView>
        <Text style={[styles.title, { color: theme.textColor }]}>{consentDetails.deviceName}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Consent ID</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.id}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Summary</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.summary}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Purpose</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.purposes}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Processing</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.processing}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Data Category</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.dataCategory}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Measures</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.measures}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Legal Bases</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.legalBases}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Storage</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.storage}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Scale</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.scale}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Duration</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.duration}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Frequency</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.frequency}</Text>
        <Text style={[styles.data, { color: theme.textColor }]}>Location</Text>
        <Text style={[styles.deviceText, { color: theme.textColor }]}>{consentDetails.location}</Text>
      </ScrollView>
  
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.textColor }]}
        onPress={handleGiveConsent}
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>Give Consent</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.backgroundColor }]}
        onPress={() => navigation.navigate('Manage Consents')}
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>Return</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        style={[styles.deleteButton, { borderColor: theme.textColor }]}
        onPress={() => { setModalVisible(true); setContainerOpacity(0.5); }}
      >
        <Text style={styles.buttonText}>Delete Consent</Text>
      </TouchableOpacity>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalView, { backgroundColor: theme.backgroundColor }]}>
          <Text style={[styles.responseText, { color: theme.textColor }]}>
            Are you sure you want to delete your consent to "{consentDetails.id}" for the device "{consentDetails.deviceName}"?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: theme.textColor }]}
              onPress={handleDeleteConsent}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.backgroundColor, borderColor: theme.backgroundColor }]}
              onPress={() => {setModalVisible(false); setContainerOpacity(1); }}
            >
              <Text style={[styles.buttonText, { color: theme.textColor }]}>Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSuccessModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
            <View style={styles.responseWithLogo}>
              <Image
                source={require('../assets/adpc_logo_high.png')}
                style={styles.logo}
              />
              <Text style={[styles.responseText, { color: theme.textColor }]}>Consent successfully given!</Text>
            </View>
          </View>
        </Modal>
    
        <Modal
          animationType="slide"
          transparent={true}
          visible={isDeleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
            <View style={styles.responseWithLogo}>
              <Image
                source={require('../assets/adpc_logo_high.png')}
                style={styles.logo}
              />
              <Text style={[styles.responseText, { color: theme.textColor }]}>Consent successfully deleted!</Text>
            </View>
          </View>
        </Modal>
      </View>
  );    
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  deviceContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  data: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  deviceText: {
    marginTop: 5,
    fontSize: 14,
    marginBottom: 20,
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
  deleteButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
    backgroundColor: '#8F0000'
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
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
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    fontSize: 16, 
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default DeviceDetailScreen;