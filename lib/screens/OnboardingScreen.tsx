import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { Video } from 'expo-av';
import { setItem } from '../utils/async_storage';
import { defaultTextFont } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const handleDone = () => {
    navigation.navigate('Login');
    setItem('onboarded', '1');
  };

  const doneButton = ({ ...props }) => (
    <TouchableOpacity style={styles.doneButton} {...props}>
      <Text style={styles.doneButtonText}>Done</Text>
    </TouchableOpacity>
  );

  const skipButton = ({ ...props }) => (
    <TouchableOpacity style={styles.skipButton} {...props}>
      <Text style={styles.buttonText}>Skip</Text>
    </TouchableOpacity>
  );

  const nextButton = ({ ...props }) => (
    <TouchableOpacity style={styles.nextButton} {...props}>
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
  );

  return (
    <Onboarding
      onDone={handleDone}
      onSkip={handleDone}
      DoneButtonComponent={doneButton}
      SkipButtonComponent={skipButton}
      NextButtonComponent={nextButton}
      pages={[
        {
          backgroundColor: '#87ceeb',
          image: (
            <Video
              source={require('../../assets/videos/v3_1.mp4')}
              style={{ width, height }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: 'Welcome to Our App!',
          subtitle: 'Learn more about our features in this onboarding experience.',
        },
        {
          backgroundColor: '#ff7f50',
          image: (
            <Video
              source={require('../../assets/videos/v1.mp4')}
              style={{ width, height }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: 'Stay Connected',
          subtitle: 'Interact and stay connected with our community.',
        },
        {
          backgroundColor: '#ffe135',
          image: (
            <Video
              source={require('../../assets/videos/v4_1.mp4')}
              style={{ width, height }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: 'Get Notified',
          subtitle: 'Receive instant notifications and stay updated.',
        },
        {
          backgroundColor: '#ffa280',
          image: (
            <Video
              source={require('../../assets/videos/v2.mp4')}
              style={{ width, height }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: 'Explore Features',
          subtitle: 'Discover new functionalities tailored just for you.',
        },
        {
          backgroundColor: '#90ee90',
          image: (
            <Video
              source={require('../../assets/videos/v5_2.mp4')}
              style={{ width, height}}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: 'Get Started!',
          subtitle: 'Tap "Done" to start using the app.',
        },
      ]}
      transitionAnimationDuration={300}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    ...defaultTextFont,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    ...defaultTextFont,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...defaultTextFont,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    ...defaultTextFont,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingScreen;
