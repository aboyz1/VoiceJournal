import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  getFocusedRouteNameFromRoute,
  RouteProp,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import HomeScreen from "../screens/HomeScreen";
import JournalScreen from "../screens/JournalScreen";
import ReviewScreen from "../screens/ReviewScreen";

// Use unique names for tab and stack screens
export type RootStackParamList = {
  Home: undefined; // Tab name
  Journal: undefined;
  HomeScreen: undefined; // Stack screen name
  Review: { audioUri: string };
};

const Tab = createBottomTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Review" component={ReviewScreen} />
  </Stack.Navigator>
);

// Helper function to control tab bar visibility
const getTabBarVisibility = (
  route: RouteProp<RootStackParamList, keyof RootStackParamList> | any
) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "HomeScreen";
  if (routeName === "Review") {
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
          else iconName = "document-text";

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#ff4757",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          display: getTabBarVisibility(route),
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Journal" component={JournalScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
