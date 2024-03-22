// DeviceDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import ThemeContext from '../ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useContext, useState } from 'react';


const DeviceDetailScreen = ({ route }) => {
  const device = route.params?.device;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const containerOpacity = isModalVisible ? 0.5 : 1;

  if (!device) {
    // Return a fallback UI or navigate back
    return <Text>No device data available.</Text>;
  }


  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor, opacity: containerOpacity }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{device.deviceName}</Text>
      <Text style={[styles.data, { color: theme.textColor }]}>Type</Text>
      <Text style={[styles.deviceText, { color: theme.textColor }]}>{device.text}</Text>
      <Text style={[styles.data, { color: theme.textColor }]}>Data Collected </Text>
      <Text style={[styles.deviceText, { color: theme.textColor }]}>{device.collectedData}</Text>
      <Text style={[styles.data, { color: theme.textColor }]}>Purpose</Text>
      <Text style={[styles.deviceText, { color: theme.textColor }]}>{device.purpose}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]}
      onPress={() => navigation.navigate('Manage Consents')}>
        <Text style={[styles.buttonText, { color: theme.textColor }]}>
          Return
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton}
      onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>
          Delete Consents
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
                Are you sure you want to delete your consents for this device?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.buttonTextColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.backgroundColor }]}>Return</Text>
              </TouchableOpacity>
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
    borderRadius: 5,
    alignItems: 'center',
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
    backgroundColor: "#2196F3",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
});

export default DeviceDetailScreen;
