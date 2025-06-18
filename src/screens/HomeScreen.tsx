import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MicButton from '../components/MicButton';

const HomeScreen = () => {
  const handleMicPress = () => {
    console.log('Mic pressed - recording logic will go here');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap to Record</Text>
      <MicButton onPress={handleMicPress} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 22,
    marginBottom: 32,
  },
});
