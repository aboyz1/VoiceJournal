import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MicButton from '../components/MicButton';
import { startRecording, stopRecording } from '../services/AudioService';

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);

  const onMicPress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      console.log("Recording saved to:", uri);
      // Navigate to Review screen later
    } else {
      await startRecording();
    }
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Voice Journal</Text>
      <MicButton onPress={onMicPress} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
  },
});