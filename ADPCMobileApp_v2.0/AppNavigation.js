// Importing necessary React and React Navigation components and contexts.
import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AboutScreen from './screens/AboutScreen';
import HomeScreen from './screens/HomeScreen';
import ThemeContext from './ThemeContext';
import SettingsScreen from './screens/SettingsScreen';
import DeviceRegistrationScreen from './screens/DeviceRegistrationScreen';
import DiscoverDevicesScreen from './screens/DiscoverDevicesScreen';
import ManageConsentsScreen from './screens/ManageConsentsScreen';
import HiddenStack from './HiddenStackNavigator';


// Create a Drawer navigator instance.
const Drawer = createDrawerNavigator();

const AppNavigation = () => {
    // Access the current theme from ThemeContext to apply dynamic theming.
    const { theme } = useContext(ThemeContext);

    // Define a custom drawer content component to customize the appearance of the drawer.
    const CustomDrawerContent = (props) => {
        return (
            <DrawerContentScrollView {...props} style={{ backgroundColor: theme.backgroundColor }}>
                <DrawerItemList {...props} 
                    labelStyle={{ color: theme.textColor }} // Assuming you have a textColor in your theme
                    activeTintColor={theme.textColor} // Use theme colors for active item label
                    inactiveTintColor={theme.textColor} // Use theme colors for inactive item label
                    activeBackgroundColor={theme.backgroundColor} // Use theme color for active item background
                    itemStyle={{ backgroundColor: theme.backgroundColor }} // Use theme color for item background
                />
            </DrawerContentScrollView>
        );
    };

    return (
        <Drawer.Navigator
            screenOptions={{
                drawerLabelStyle: {
                    color: theme.textColor,
                },
                headerStyle: {
                    backgroundColor: theme.backgroundColor, // Apply background color from the theme for header
                },
                headerTintColor: theme.textColor, // Apply text color from the theme for header text
                drawerStyle: {
                    backgroundColor: theme.backgroundColor, // Apply background color from the theme for drawer
                },
            
                
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            
            { /*} <Drawer.Screen         // Copy and uncomment code to add more screens to the navigator
                name="Home" 
                component={HomeScreen} 
                options={{ 
                    drawerLabel: 'Home',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            /> */}
            <Drawer.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ 
                    drawerLabel: 'Home',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            /> 
            <Drawer.Screen 
                name="Discover Devices" 
                component={DiscoverDevicesScreen} 
                options={{ 
                    drawerLabel: 'Discover Devices',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            />
            <Drawer.Screen 
                name="Manage Consents" 
                component={ManageConsentsScreen} 
                options={{ 
                    drawerLabel: 'Manage Consents',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            />
            { /*<Drawer.Screen 
                name="Device Registration" 
                component={DeviceRegistrationScreen} 
                options={{ 
                    drawerLabel: 'Register Device',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            /> */}
            <Drawer.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ 
                    drawerLabel: 'Settings',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            />
            <Drawer.Screen 
                name="About" 
                component={AboutScreen} 
                options={{ 
                    drawerLabel: 'About',
                    drawerLabelStyle: {
                        color: theme.textColor, 
                    },
                }}
            />
            <Drawer.Screen 
                name="Device Details" 
                component={HiddenStack} 
                options={{ drawerItemStyle: { height: 0 } }}
            />
        </Drawer.Navigator>
    );
};

export default AppNavigation;
