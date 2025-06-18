import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
// import other screens as you build them

export type RootStackParamList = {
  Home: undefined;
  // Add other screens like Review, Journal, Detail, etc.
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Voice Journal' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
