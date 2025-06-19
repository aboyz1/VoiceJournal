import { Audio } from 'expo-av';
import { showErrorAlert } from '../utils/alertUtils';

let recording: Audio.Recording | null = null;

export const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: 2, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    audioQuality: 2, // Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      showErrorAlert('Permission Required', 'Microphone permission is required to record audio');
      return null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS);
    await recording.startAsync();
    return recording;
  } catch (error) {
    console.error("Failed to start recording", error);
    showErrorAlert('Recording Error', 'Failed to start recording. Please try again.');
    return null;
  }
}

export const stopRecording = async (): Promise<string | null> => {
  if (!recording) return null;
  
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    return uri;
  } catch (error) {
    console.error("Stop recording error:", error);
    showErrorAlert('Recording Error', 'Failed to stop recording. Please try again.');
    return null;
  }
};

export const isRecording = (): boolean => {
  return recording !== null;
};
