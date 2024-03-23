// Importing necessary React and React Navigation components and contexts.
import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// Importing screens that will be used in navigation.
import AboutScreen from './screens/AboutScreen';
import HomeScreen from './screens/HomeScreen';
import ThemeContext from './ThemeContext';
import SettingsScreen from './screens/SettingsScreen';
import DeviceRegistrationScreen from './screens/DeviceRegistrationScreen';
import DiscoverDevicesScreen from './screens/DiscoverDevicesScreen';
import ManageConsentsScreen from './screens/ManageConsentsScreen';
import HiddenStack from './HiddenStackNavigator';

// DrawerNavigator resembles a "Burger Menu (Three horizontal bars)" in the UI
const Drawer = createDrawerNavigator();

const AppNavigation = () => {

    const { theme } = useContext(ThemeContext);
    // Define a custom drawer content component to customize the appearance of the drawer.
    const CustomDrawerContent = (props) => {
        return (
            <DrawerContentScrollView {...props} style={{ backgroundColor: theme.backgroundColor }}>
                <DrawerItemList {...props} 
                    labelStyle={{ color: theme.textColor }} 
                    activeTintColor={theme.textColor} 
                    inactiveTintColor={theme.textColor} 
                    activeBackgroundColor={theme.backgroundColor} 
                    itemStyle={{ backgroundColor: theme.backgroundColor }} 
                />
            </DrawerContentScrollView>
        );
    };

    return (
        // Drawer.Navigator setup with custom configurations for theming and the custom drawer content.
        <Drawer.Navigator
            screenOptions={{
                drawerLabelStyle: {
                    color: theme.textColor,
                },
                headerStyle: {
                    backgroundColor: theme.backgroundColor, 
                },
                headerTintColor: theme.textColor, 
                drawerStyle: {
                    backgroundColor: theme.backgroundColor, 
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
            {/* HiddenStack is used for navigating to the device detail screen but is hidden from the drawer. */}
            <Drawer.Screen 
                name="Device Details" 
                component={HiddenStack} 
                options={{ drawerItemStyle: { height: 0 } }} // Makes this navigation item not visible in the drawer.
            />
        </Drawer.Navigator>
    );
};

export default AppNavigation;