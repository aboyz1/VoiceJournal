import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import ReviewScreen from '../screens/ReviewScreen';
// import EntryDetailScreen from '../screens/EntryDetailScreen';

export type RootStackParamList = {
  EntryDetail: { entryId: number };
};

// const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// const EntryStack = () => (
//   <Stack.Navigator>
//     <Stack.Screen
//       name="EntryDetail"
//       component={EntryDetailScreen}
//       options={{ title: 'Entry Detail' }}
//     />
//   </Stack.Navigator>
// );

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Journal') iconName = 'book';
          else if (route.name === 'Review') iconName = 'list';
          else iconName = 'document-text';

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff4757',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Review" component={ReviewScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
