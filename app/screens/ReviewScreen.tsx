import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReviewScreen = () => (
  <View style={styles.container}>
    <Text>Review Screen</Text>
  </View>
);

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
