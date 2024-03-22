// Import statements to include necessary modules and components from React, React Native, and additional libraries.
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import ThemeContext from '../ThemeContext';
import { useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import { useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBLE } from '../BLEContext';


// The DeviceDetailScreen functional component declaration. It receives 'route' props to access passed parameters.
const DeviceDetailScreen = () => {
  const [consentDetails, setConsentDetails] = useState('');
  const route = useRoute();
  const { peripheralId, consentId } = route.params;


  console.log("Received parameters:", { peripheralId, consentId });

  
  // Using the useNavigation hook to programmatically navigate between screens.
  const navigation = useNavigation();
  // Accessing the current theme from ThemeContext using the useContext hook.
  const { theme } = useContext(ThemeContext);
  // State hook for controlling the visibility of the modal dialog.
  const [isModalVisible, setModalVisible] = useState(false);
  // Dynamically setting the container opacity based on modal visibility.
  const [ containerOpacity, setContainerOpacity] = useState(1);
  const { writeConsentResponse } = useBLE();
  const { deleteConsent } = useBLE();
  const acceptedConsentIds = [];

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);



  useFocusEffect(
    useCallback(() => {
      const loadConsentDetails = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@devicesConsents');
          const devices = jsonValue != null ? JSON.parse(jsonValue) : [];
          console.log('devices: ', devices)
          console.log('periph: ', peripheralId)
          console.log('cons: ', consentId)
          const device = devices.find(d => d.peripheralId === peripheralId);
          console.log('device ', device)
          if (device) {
            const consent = device.consents.find(c => c.id === consentId);
            if (consent) {
              setConsentDetails(consent);
              console.log('consentdetails', consentDetails)
            }
          }
        } catch (e) {
          console.error("Failed to load consent details from AsyncStorage", e);
        }
      };
    

      loadConsentDetails();
    }, [peripheralId, consentId])
    
  );

  const handleGiveConsent = () => {
    acceptedConsentIds.push(consentDetails.id);
    console.log('accepted', acceptedConsentIds);
    if (peripheralId && acceptedConsentIds.length > 0) {
      writeConsentResponse(peripheralId, acceptedConsentIds)
          setSuccessModalVisible(true); // Show success message
          setContainerOpacity(0.5);
          
          // Set a timeout to hide the message and navigate after a few seconds
          setTimeout(() => {
            setSuccessModalVisible(false);
            setContainerOpacity(1);
            navigation.navigate('Manage Consents'); // Navigate back
          }, 2000); // Adjust the time as needed
        
    } else {
      console.log("Peripheral ID or Consent IDs missing");
    }
  };

  const handleDeleteConsent = async () => {
    console.log('Deleting consent', consentDetails.id);
  
    try {
      // Step 1: Fetch the current list of devices and their consents from AsyncStorage
      const jsonValue = await AsyncStorage.getItem('@devicesConsents');
      let devices = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Step 2: Find the device and remove the consent from its list
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
  
        // Step 3: Save the updated list back to AsyncStorage
        await AsyncStorage.setItem('@devicesConsents', JSON.stringify(devices));
        deleteConsent(peripheralId, consentDetails.id); // Assuming this is a function to handle additional cleanup
        console.log('Consent deleted successfully');
  
        // Update UI or state as needed
        setDeleteModalVisible(true);
        setModalVisible(false);
        setContainerOpacity(0.5);
        
        // Automatically navigate back after a delay
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
      <Text style={[styles.data, { color: theme.textColor }]}>Data Category </Text>
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
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.textColor }]}
      onPress={handleGiveConsent}>
        <Text style={[styles.buttonText, { color: theme.textColor }]}>
          Give Consent
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor, borderColor: theme.backgroundColor }]}
      onPress={() => navigation.navigate('Manage Consents')}>
        <Text style={[styles.buttonText, { color: theme.textColor }]}>
          Return
        </Text>
      </TouchableOpacity >
      <TouchableOpacity style={[styles.deleteButton, {borderColor: theme.textColor}]}
      onPress={() => { setModalVisible(true),
        setContainerOpacity(0.5) }}>
        <Text style={styles.buttonText}>
          Delete Consent
        </Text>
      </TouchableOpacity>


      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >

        <View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
          
              <Text style={[styles.responseText, { color: theme.textColor }]}>
                Are you sure you want to delete your consent to "{consentDetails.id}" for the device "{consentDetails.deviceName}"?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                style={[styles.deleteButton, {borderColor: theme.textColor}]}
                onPress={handleDeleteConsent}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.backgroundColor, borderColor: theme.backgroundColor }]}
                onPress={() => setModalVisible(false)}
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
