import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  getFocusedRouteNameFromRoute,
  RouteProp,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import EntryDetailScreen from "../screens/EntryDetailScreen";
import HomeScreen from "../screens/HomeScreen";
import JournalScreen from "../screens/JournalScreen";
import ReviewScreen from "../screens/ReviewScreen";
import TrendsScreen from "../screens/TrendsScreen";

// Update the RootStackParamList to include transcription parameter
export type RootStackParamList = {
  Home: undefined;
  Review: {
    audioUri?: string;
    entryId?: string;
    transcription?: string;
    duration?: number;
  };
  Journal: undefined;
  Trends: undefined;
  EntryDetail: { entryId: string };
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Review" component={ReviewScreen} />
    <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
  </Stack.Navigator>
);
// Create a Journal Stack to handle EntryDetail navigation from Journal tab
const JournalStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Journal" component={JournalScreen} />
    <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
  </Stack.Navigator>
);
// Create a Trends Stack (in case you need navigation from Trends later)
const TrendsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Trends" component={TrendsScreen} />
  </Stack.Navigator>
);
// Helper function to control tab bar visibility
const getTabBarVisibility = (
  route: RouteProp<RootStackParamList, keyof RootStackParamList> | any
) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeScreen";
  if (routeName === "Review" || routeName === "EntryDetail") {
    return "none";
  }
  return "flex";
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Journal") iconName = "book";
          else if (route.name === "Trends") iconName = "trending-up";
          else iconName = "document-text";

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4111c7da",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          display: getTabBarVisibility(route),
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Journal" component={JournalStack} />
      <Tab.Screen name="Trends" component={TrendsStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
