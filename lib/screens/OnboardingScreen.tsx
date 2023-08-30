import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import LottieView from "lottie-react-native";
import { setItem } from "../utils/async_storage";

const { width, height } = Dimensions.get("window");

type OnboardingProps = {
  navigation: any;
};

const OnboardingScreen: React.FC<OnboardingProps> = ({ navigation }) => {
  const handleDone = () => {
    navigation.navigate("Login");
    setItem("onboarded", "1");
  };

  const doneButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.doneButton} {...props}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    );
  };

  const skipButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.skipButton} {...props}>
        <Text style={styles.buttonText}>Skip</Text>
      </TouchableOpacity>
    );
  };

  const nextButton = ({ ...props }) => {
    return (
      <TouchableOpacity style={styles.nextButton} {...props}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    );
  };

  const [lottieProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(lottieProgress, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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
          backgroundColor: "#a7f3d0",
          image: (
            <LottieView
              progress={lottieProgress}
              style={{ width: width * 0.5, height: width }}
              source={require("../../assets/animations/achieve.json")}
              renderMode={"SOFTWARE"}
            />
          ),
          title: "The Ethnographer's Companion",
          subtitle:
            "Seamlessly integrate audio, video, and images into your notes to create rich, multi-dimensional observations.",
        },
        {
          backgroundColor: "#fef3c7",
          image: (
            <LottieView
              progress={lottieProgress}
              style={{ width: width * 0.3, height: width }}
              source={require("../../assets/animations/work.json")}
            />
          ),
          title: "Privacy Meets Collaboration",
          subtitle:
            "Maintain control over your sensitive data while sharing insights with fellow researchers worldwide.",
        },
        {
          backgroundColor: "#a78bfa",
          image: (
            <LottieView
              progress={lottieProgress}
              style={{ width: width * 0.3, height: width, marginLeft: 25 }}
              source={require("../../assets/animations/boost.json")}
            />
          ),
          title: "A World of Ethnographic Insight",
          subtitle:
            "Explore diverse perspectives through a rich collection of shared ethnographic notes.",
        },
      ]}
      transitionAnimationDuration={300}
    />
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 10, // To prevent the text from touching the screen edge
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ccc", // Light grey
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Shadow for Android
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2", // Same blue as doneButton
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Shadow for Android
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  lottie: {
    width: width * 0.9,
    height: width,
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2", // A shade of blue
    borderRadius: 30, // Rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Shadow for Android
    alignItems: "center", // Aligning text in the center
    justifyContent: "center", // Aligning text in the center
  },
  doneButtonText: {
    color: "white", // White text color
    fontWeight: "bold", // Bold font
    fontSize: 16, // Font size
  },
});

export default OnboardingScreen;
