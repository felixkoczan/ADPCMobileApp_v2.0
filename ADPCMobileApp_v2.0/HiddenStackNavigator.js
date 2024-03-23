// HiddenStackNavigator.js
// Import the createStackNavigator function from the @react-navigation/stack package,
// allowing for the creation of a stack navigator in the app. HiddenStack allows for
// a Screen to not be shown to the User, only upon trigger of an event.
import { createStackNavigator } from '@react-navigation/stack';
import DeviceDetailScreen from './screens/DeviceDetailScreen';

const Stack = createStackNavigator();

const HiddenStack = () => {
    return (
      // screenOptions={{ headerShown: false }} hides the header from all screens in this navigator.
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DeviceDetailScreen" component={DeviceDetailScreen} />
      </Stack.Navigator>
    );
};

export default HiddenStack;
