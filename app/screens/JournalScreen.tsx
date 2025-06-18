import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const JournalScreen = () => (
  <View style={styles.container}>
    <Text>Journal Screen</Text>
  </View>
);

export default JournalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
