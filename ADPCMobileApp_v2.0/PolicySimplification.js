import React, { useState, useContext } from 'react';
import { View, TextInput, Image, ActivityIndicator, Text, Keyboard } from 'react-native'; // Removed isLoading from here
import ThemeContext from './ThemeContext';
import { apiCall } from './apis/OpenAIApi';
import { StyleSheet } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

// In PolicySimplification.js or wherever you define simplifyPolicy
export const simplifyPolicy = async (text, setResponse, setIsLoading) => {
  setIsLoading(true);
  try {
    const result = await apiCall(text);
    if (result.success) {
      setResponse(result.data);
    } else {
      console.error(result.msg);
      setResponse("Failed to fetch response.");
    }
  } catch (error) {
    console.error('Error submitting prompt:', error);
    setResponse("An error occurred while fetching the response.");
  } finally {
    setIsLoading(false);
  }
};
