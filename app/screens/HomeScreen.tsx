import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import MicButton from '../components/MicButton';
import { startRecording, stopRecording } from '../services/AudioService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = new Animated.Value(1);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const interval = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation for recording state
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const onMicPress = async () => {
    if (isRecording) {
      // Stop recording
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
      stopPulseAnimation();
      const uri = await stopRecording();
      if (uri) {
        navigation.navigate('Review', { audioUri: uri });
      } else {
        console.log("Failed to get recording URI");
      }
      setRecordingTime(0);
    } else {
      // Start recording
      startPulseAnimation();
      await startRecording();
      // Start timer
      interval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    setIsRecording(!isRecording);
  };

  // Format recording time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Voice Journal</Text>
      
      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingContainer}>
          <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingText}>Recording {formatTime(recordingTime)}</Text>
        </View>
      )}

      <MicButton 
        onPress={onMicPress} 
        isRecording={isRecording} 
      />
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
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff4757',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    color: '#ff4757',
    fontWeight: '500',
  },
});