// Import React and necessary hooks
import React, { useContext } from 'react'; // Import React and the useContext hook for using context
// Import necessary components and APIs from react-native
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'; // Import UI components and StyleSheet for styling
// Import the ThemeContext to use for theme switching (dark/light mode)
import ThemeContext from '../ThemeContext'; // Import the custom ThemeContext for theme management
// import Logo from '../assets/ADPC_Logo_high.png'; // Path to logo image, uncomment if you need to use the ADPC Logo in this screen

// Define the functional component TemplateScreen
const TemplateScreen = () => {
    // Destructure theme from the ThemeContext to apply theming
    const { theme } = useContext(ThemeContext); // Use ThemeContext to support theme switching

    /* Here you can define state variables, constants, and functions that you'll use in this screen.
    For example, handling button presses or managing local state.
    */

    // The component returns JSX to render the screen
    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            {/* Image component for displaying logos or illustrations */}
            <Image source={Logo} style={styles.logo} />
            {/* Text component for screen titles, instructions, etc. */}
            <Text style={[styles.title, { color: theme.textColor }]}></Text>
            {/* Container for additional UI components like buttons */}
            <View style={styles.buttonContainer}>
            </View>
            {/* TouchableOpacity for interactive elements like buttons */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.buttonColor }]}
                onPress={() => navigation.navigate('My Button')}>
                <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>My Button</Text>
            </TouchableOpacity>
        </View>    
    );
};

// StyleSheet for styling the components
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
    padding: 10, // Add padding around the screen content
    justifyContent: 'center', // Center content vertically in the container
    alignItems: 'center', // Center content horizontally in the container
  },
  title: {
    fontSize: 22, // Title font size
    fontWeight: 'bold', // Title font weight
    marginBottom: 20, // Space below the title
    color: '#333', // Default title color, can be overridden by theme
  },
  button: {
    padding: 15, // Padding inside the button for touch area size
    borderRadius: 5, // Rounded corners for the button
    alignItems: 'center', // Center text horizontally inside the button
    justifyContent: 'center', // Center text vertically inside the button
    marginBottom: 10, // Space below the button
    width: '60%', // Button width relative to its container
  },
  buttonText: {
    fontSize: 16, // Font size for text inside the button
    fontWeight: 'bold', // Font weight for text inside the button
    // Color for the text inside the button is set dynamically via theme
  },
  logo: {
    width: 223, // Width of the logo image
    height: 100, // Height of the logo image
    marginBottom: 20, // Space below the logo image
  },
  buttonContainer: {
    alignItems: 'stretch' // Stretch button width to match container width
  },
});

// Export the component to be used in other parts of the app
export default TemplateScreen;