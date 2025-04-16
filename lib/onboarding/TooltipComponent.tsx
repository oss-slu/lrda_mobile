import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../components/ThemeProvider';

const TooltipContent = ({ 
  message, 
  onPressOk, 
  onSkip 
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip Tutorial</Text>
      </TouchableOpacity>

      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.okButton} onPress={onPressOk}>
        <Text style={styles.okText}>Okay</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.tooltipBackground || '#FFF',
      minWidth: 200,
      alignItems: 'center',
    },
    skipButton: {
      position: 'absolute',
      top: 5,
      right: 8,
    },
    skipText: {
      color: theme.homeColor || '#007AFF',
      fontWeight: 'bold',
      fontSize: 13,
    },
    message: {
      fontSize: 16,
      fontWeight: '600',
      marginVertical: 30,
      textAlign: 'center',
      color: theme.text || '#333',
    },
    okButton: {
      marginTop: 20,
      backgroundColor: theme.homeColor || '#007AFF',
      // Minimal padding so the text isn't cramped
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    okText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default TooltipContent;
