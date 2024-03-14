import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { Video } from 'expo-av';
import { setItem } from '../utils/async_storage';

const { width } = Dimensions.get('window');

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
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
      containerStyles={{ paddingHorizontal: 15 }}
      pages={[
        {
          backgroundColor: '#a7f3d0',
          image: (
            <Video
              source={require('../../assets/videos/v3.mp4')}
              style={{ width: width * 0.75, height: width * 0.5 }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: "Welcome",
          subtitle: "Introduction to our app.",
        },
        {
          backgroundColor: '#fef3c7',
          image: (
            <Video
              source={require('../../assets/videos/v1.mp4')}
              style={{ width: width * 0.75, height: width * 0.5 }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: "Feature One",
          subtitle: "Discover our first exciting feature.",
        },
        {
          backgroundColor: '#fde2e4',
          image: (
            <Video
              source={require('../../assets/videos/v4.mp4')}
              style={{ width: width * 0.75, height: width * 0.5 }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: "Feature Two",
          subtitle: "Explore the second feature.",
        },
        {
          backgroundColor: '#aacfcf',
          image: (
            <Video
              source={require('../../assets/videos/v2.mp4')}
              style={{ width: width * 0.75, height: width * 0.5 }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: "Feature Three",
          subtitle: "Learn about the third key feature.",
        },
        {
          backgroundColor: '#b99095',
          image: (
            <Video
              source={require('../../assets/videos/v5.mp4')}
              style={{ width: width * 0.75, height: width * 0.5 }}
              resizeMode="cover"
              shouldPlay
              isLooping
              isMuted={true}
            />
          ),
          title: "Feature Four",
          subtitle: "Final feature overview.",
        },
      ]}
      transitionAnimationDuration={300}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OnboardingScreen;
