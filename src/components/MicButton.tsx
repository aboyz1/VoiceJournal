import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MicButtonProps {
  onPress: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="mic" size={32} color="#fff" />
    </TouchableOpacity>
  );
};

export default MicButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4757',
    padding: 20,
    borderRadius: 50,
    elevation: 6,
  },
});
