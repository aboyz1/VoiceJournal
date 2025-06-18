import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

export type RootStackParamList = {
  Home: undefined;
  Review: { audioUri: string };
  Journal: undefined;
  EntryDetail: { entryId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      {/* Add other screens later */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
