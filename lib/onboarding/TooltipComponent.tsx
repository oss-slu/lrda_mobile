import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TooltipContent = ({ 
  message, 
  onPressOk, 
  onSkip 
}) => {
  return (
    <View style={styles.container}>
      {/* Skip Button in top-right corner */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip Tutorial</Text>
      </TouchableOpacity>

      {/* Tutorial message */}
      <Text style={styles.message}>{message}</Text>

      {/* "Okay" button */}
      <TouchableOpacity style={styles.okButton} onPress={onPressOk}>
        <Text style={styles.okText}>Okay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    minWidth: 200,
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    // Android elevation
    elevation: 5,
  },
  skipButton: {
    position: 'absolute',
    top: 5,
    right: 8,
    padding: 4,
  },
  skipText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 17, // Increased margin to push the message lower
    marginBottom: 18,
    textAlign: 'center',
    color: '#333',
  },
  okButton: {
    marginTop: 9,
    backgroundColor: '#007AFF',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  okText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TooltipContent;
