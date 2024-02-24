import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image
} from 'react-native';
import ThemeContext from '../ThemeContext';
import { apiCall } from '../apis/OpenAIApi'; // Make sure this path is correct
import { useNavigation } from '@react-navigation/native';


// Pre-defined set of data to simulate device information and consent details.
const dummyData = [
  // Each object represents a device with its consent details.
  {
    id: 'q1analytics',
    deviceName: 'Wi-Fi Hotspot',
    text: 'We track and analyse your visit(s) on this website.',
    collectedData: 'Browsing history, time spent on site, pages visited',
    purpose: 'To improve user experience and personalize content',
  },
  {
    id: 'q2recommendation',
    deviceName: 'Light Sensor',
    text: 'We personalize your experience by recommending content.',
    collectedData: 'Device usage patterns, ambient light data',
    purpose: 'To adjust screen brightness automatically for optimal viewing',
  },
  // Add more devices as needed
];

const ManageConsentsScreen = () => {
  // Accessing the theme from ThemeContext to apply styling dynamically based on the current theme.
  const { theme } = useContext(ThemeContext);
  // State hooks to manage modal visibility, modal content, and loading state.
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Hook to navigate between screens programmatically.
  const navigation = useNavigation();
  // Dynamically setting the container's opacity based on the modal's visibility.
  const containerOpacity = isModalVisible ? 0.5 : 1;

  // Function to handle the submission action for a device consent.
  const handleSubmit = async (deviceText) => {
    setModalVisible(true); // Show the modal.
    setIsLoading(true); // Indicate the start of an API call.
    try {
      // Simulate an API call with the device's consent text.
      const result = await apiCall(deviceText);
      // Conditional logic based on the API call's success.
      if (result.success) {
        // Update the modal content with the API response if successful.
        setModalContent(result.data);
      } else {
        // Log and show an error message if the API call fails.
        console.error(result.msg);
        setModalContent("Failed to fetch response.");
      }
    } catch (error) {
      // Catch and log any errors during the API call.
      console.error('Error submitting prompt:', error);
      setModalContent("An error occurred while fetching the response.");
    } finally {
      // Reset loading state once the API call is complete.
      setIsLoading(false);
    }
  };

  // Function to handle navigation to the device detail screen with the selected device's data.
  const handleManagePress = (device) => {
    console.log(device); // Log the selected device's data for debugging.
    navigation.navigate('Device Details', { screen: 'DeviceDetailScreen', params: { device: device } });
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor, opacity: containerOpacity}]}>
      <FlatList
        data={dummyData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.deviceContainer, { backgroundColor: theme.itemBackgroundColor }]}>
            <Text style={[styles.deviceName, { color: theme.textColor }]}>{item.deviceName}</Text>
            <Text style={[styles.consentText, { color: theme.textColor }]}>{item.text}</Text>
            <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.buttonTextColor, borderColor: theme.buttonTextColor }]}
              onPress={() => handleManagePress(item)}
            >
              <Text style={[styles.buttonText, { color: theme.backgroundColor }]}>Manage</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.buttonTextColor, borderColor: theme.buttonTextColor }]}
              onPress={() => handleSubmit(item.text)}
            >
              <Text style={[styles.buttonText, { color: theme.backgroundColor }]}>Simplify</Text>
            </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >

<View style={[styles.modalView, {backgroundColor: theme.backgroundColor}]}>
          {isLoading ? (
            <ActivityIndicator size="large" color='#05648f' />
          ) : (
            <>
              <View style={styles.responseWithLogo}>
                <Image
                  source={require('../assets/ADPC_Logo_high.png')} // Update this path as needed
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
  // Add your styles here
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
    fontSize: 16,
  },
  consentText: {
    marginTop: 5,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
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
});

export default ManageConsentsScreen;
