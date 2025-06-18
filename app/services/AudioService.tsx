import { Audio } from "expo-av";

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

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") return null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_OPTIONS);
    await recording.startAsync();
    return recording;
  } catch (e) {
    console.error("Failed to start recording", e);
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
  } catch (err) {
    console.error("Stop recording error:", err);
    return null;
  }
};
