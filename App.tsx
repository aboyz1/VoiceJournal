import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './app/navigation/AppNavigator';
import { initDatabase } from './app/data/Database';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {

    const initApp = async () => {
      try {
        console.log('[App] Initializing database...');
        await initDatabase();
        console.log('[App] Database initialized successfully');
        setIsDbReady(true);
      } catch (error) {

        console.error('[App] Failed to initialize database:', error);
        setDbError('Failed to initialize database');
      }
    };


    
    initApp();
  }, []);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', textAlign: 'center', padding: 20 }}>
          {dbError}
        </Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Setting up database...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
