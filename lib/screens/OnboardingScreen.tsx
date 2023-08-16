import React, { useState, useRef, useEffect } from "react";
import { Animated, Easing, View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
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
        <Text>Done</Text>
      </TouchableOpacity>
    );
  };

  const [lottieProgress] = useState(new Animated.Value(0)); // Declare the state variable

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
      containerStyles={{ paddingHorizontal: 15 }}
      pages={[
        {
          backgroundColor: "#a7f3d0",
          image: (
            <View>
              <LottieView
                progress={lottieProgress} // Use the lottieProgress state variable
                loop={true}
                autoPlay
                style={{ width: width * 0.9, height: width }}
                source={require("../../assets/animations/test.json")}
                renderMode={"SOFTWARE"}
              />
            </View>
          ),
          title: "Capture Every Detail",
          subtitle: "Seamlessly record location, audio, video, and pictures in one comprehensive ethnographic note.",
        },
        {
          backgroundColor: "#fef3c7",
          image: (
            <LottieView
              style={{ width: width * 0.9, height: width }}
              source={require("../../assets/animations/work.json")}
              autoPlay
              loop
            />
          ),
          title: "Privacy Meets Collaboration",
          subtitle: "Maintain control over your sensitive data while sharing insights with fellow researchers worldwide.",
        },
        {
          backgroundColor: "#a78bfa",
          image: (
            <LottieView
              style={{ width: width * 0.9, height: width }}
              source={require("../../assets/animations/achieve.json")}
              autoPlay
              loop
            />
          ),
          title: "Achieve Higher Goals",
          subtitle:
            "By boosting your productivity we help you to achieve higher goals",
        },
      ]}
      transitionAnimationDuration={300}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  lottie: {
    width: width * 0.9,
    height: width,
  },
  doneButton: {
    padding: 20,
    backgroundColor: "white",
    // borderTopLeftRadius: '100%',
    // borderBottomLeftRadius: '100%'
  },
});

export default OnboardingScreen;
