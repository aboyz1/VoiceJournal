import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { startRecording, stopRecording } from "../services/AudioService";
import { theme } from "../theme/theme";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const SoundWave = ({ isRecording }: { isRecording: boolean }) => {
  const animValues = useRef(
    Array(5)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (isRecording) {
      const animations = animValues.map((val) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: 1.8 + Math.random() * 0.7,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 1,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
          ])
        )
      );
      animations.forEach((anim) => anim.start());
      return () => animations.forEach((anim) => anim.stop());
    } else {
      animValues.forEach((val) => val.setValue(1));
    }
  }, [isRecording]);

  return (
    <View style={styles.waveContainer as ViewStyle}>
      {animValues.map((val, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar as ViewStyle,
            {
              transform: [{ scaleY: val }],
              backgroundColor:
                index % 2 === 0
                  ? theme.colors.primary
                  : theme.colors.primaryLight,
            } as ViewStyle,
          ]}
        />
      ))}
    </View>
  );
};
const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "processing"
  >("idle");
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waveAnim.stopAnimation();
    }
  }, [isRecording]);

  const startRecordingSession = async () => {
    setRecordingState("recording");
    await startRecording();
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const stopRecordingSession = async () => {
    setRecordingState("processing");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const uri = await stopRecording();

    if (uri) {
      navigation.navigate("Review", { audioUri: uri });
    }

    setRecordingTime(0);
    setRecordingState("idle");
  };

  const onMicPress = async () => {
    if (recordingState === "processing") return;

    if (isRecording) {
      await stopRecordingSession();
    } else {
      await startRecordingSession();
    }
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const waveInterpolation = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <View style={styles.content as ViewStyle}>
        <Text style={styles.title as TextStyle}>Voice Journal</Text>
        <Text style={styles.subtitle as TextStyle}>
          Tap to record your thoughts
        </Text>

        <View style={styles.visualizationContainer as ViewStyle}>
          {isRecording ? (
            <>
              <Animated.View
                style={[
                  styles.soundWave as ViewStyle,
                  { transform: [{ rotate: waveInterpolation }] } as ViewStyle,
                ]}
              />
              <SoundWave isRecording={isRecording} />
            </>
          ) : (
            <Ionicons name="mic" size={120} color={theme.colors.primary} />
          )}
        </View>

        {isRecording && (
          <View style={styles.recordingInfo as ViewStyle}>
            <View style={styles.recordingIndicator as ViewStyle}>
              <View style={styles.recordingDot as ViewStyle} />
              <Text style={styles.recordingText as TextStyle}>RECORDING</Text>
            </View>
            <Text style={styles.timerText as TextStyle}>
              {formatTime(recordingTime)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.micButton as ViewStyle,
          isRecording && (styles.micButtonActive as ViewStyle),
          recordingState === "processing" &&
            (styles.micButtonProcessing as ViewStyle),
        ]}
        onPress={onMicPress}
        activeOpacity={0.8}
      >
        {recordingState === "processing" ? (
          <ActivityIndicator size="small" color={theme.colors.surface} />
        ) : (
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={32}
            color={theme.colors.surface}
          />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing["4xl"],
  },
  visualizationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing["3xl"],
    position: "relative",
  },
  soundWave: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: `${theme.colors.primary}33`,
  },
  waveContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginVertical: theme.spacing.lg,
  },
  waveBar: {
    width: 8,
    height: 30,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
  },
  micIcon: {
    opacity: 0.8,
  },
  recordingInfo: {
    alignItems: "center",
    marginBottom: theme.spacing["3xl"],
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.recording,
    marginRight: theme.spacing.sm,
  },
  recordingText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.recording,
    letterSpacing: 1.2,
  },
  timerText: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: theme.spacing["3xl"],
    ...theme.shadows.lg,
  },
  micButtonActive: {
    backgroundColor: theme.colors.recording,
    transform: [{ scale: 1.1 }],
  },
  micButtonProcessing: {
    backgroundColor: theme.colors.processing,
  },
});
export default HomeScreen;
