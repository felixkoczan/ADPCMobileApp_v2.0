import { createStackNavigator } from '@react-navigation/stack';
import DeviceDetailScreen from './screens/DeviceDetailScreen'
// Import other screens

const Stack = createStackNavigator();

const HiddenStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DeviceDetailScreen" component={DeviceDetailScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    );
  };
  
  export default HiddenStack;