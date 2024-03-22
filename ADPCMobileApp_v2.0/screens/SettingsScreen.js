// Import statements to include necessary hooks and components from React and React Native.
import React, { useState, useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
// Importing ThemeContext to access and modify the app's theme.
import ThemeContext from '../ThemeContext';

// Definition of the SettingsScreen functional component.
const SettingsScreen = () => {
    // Destructuring to extract `theme` and `toggleTheme` from ThemeContext,
    // allowing this component to use and modify the app's theme.
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    // State hooks for managing settings. Each setting is initialized to `false`.
    // `darkModeSetting` controls the dark mode feature.
    const [darkModeSetting, setDarkModeSetting] = useState(false);
    // `cloudSetting` could be for enabling/disabling cloud sync.
    const [cloudSetting, setCloudSetting] = useState(false);
    // `notificationSetting` controls whether notifications are enabled.
    const [notificationSetting, setNotificationSetting] = useState(false);
    
    // A component used to visually separate different sections/settings on the screen.
    const Separator = () => <View style={styles.separator} />;


    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        
        
        <View style={styles.setting}>
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: theme.textColor }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: theme.textColor }]}>
                    Enables a darker theme for the app.
                </Text>
            </View>
            <Switch
                value={darkModeSetting}
                onValueChange={(newValue) => {
                    setDarkModeSetting(newValue);
                    toggleTheme(); // Assuming toggleTheme changes the theme context
                }}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={darkModeSetting ? "#f5dd4b" : "#f4f3f4"}
            />
        </View>
<Separator/>
        <View style={styles.setting}>
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: theme.textColor }]}>Notify me</Text>
                <Text style={[styles.settingDescription, { color: theme.textColor }]}>
                    If you want to be notified of nearby devices which may collect your data, enable this setting.
                </Text>
            </View>
            <Switch
                value={notificationSetting}
                onValueChange={setNotificationSetting}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={notificationSetting ? "#f5dd4b" : "#f4f3f4"}
            />
        </View>
        <Separator/>
        <View style={styles.setting}>
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: theme.textColor }]}>Store my Data in Next Cloud</Text>
                <Text style={[styles.settingDescription, { color: theme.textColor }]}>
                    Enabling this will securely store your data in the Next Cloud, ensuring it's backed up and accessible across devices.
                </Text>
            </View>
            <Switch
                value={cloudSetting}
                onValueChange={setCloudSetting}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={cloudSetting ? "#f5dd4b" : "#f4f3f4"}
            />
        </View>
    </View>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 10,
},
title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 10,
},
setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    marginBottom: 20,
},
settingTextContainer: {
    flex: 1, 
},
settingText: {
    fontSize: 16,
    fontWeight: 'bold',
},
settingDescription: {
    fontSize: 14,
    marginTop: 4, 
},
separator: {
    height: 1,
    backgroundColor: '#CED0CE',
    marginVertical: 10, 
},
});


export default SettingsScreen;