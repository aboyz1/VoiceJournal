import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
};

const MicButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="mic" size={36} color="#fff" />
    </TouchableOpacity>
  );
};

export default MicButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4757',
    padding: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
