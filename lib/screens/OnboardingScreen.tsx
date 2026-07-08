import React from "react";
import { Dimensions, TouchableOpacity, Text } from "react-native";
import Onboarding from "react-native-onboarding-swiper";
import { VideoView, useVideoPlayer, VideoSource } from "expo-video";
import { useOnboardingStore } from "../stores/onboardingStore";

const { width, height } = Dimensions.get("window");

const BackgroundVideo = ({ source }: { source: VideoSource }) => {
  const player = useVideoPlayer(source, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return <VideoView player={player} style={{ width, height }} contentFit="cover" nativeControls={false} />;
};

const OnboardingScreen = () => {
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const handleDone = () => {
    completeOnboarding();
  };

  const doneButton = ({ ...props }: any) => (
    <TouchableOpacity className="items-center justify-center rounded-[30px] bg-[#4A90E2] px-5 py-2.5" {...props}>
      <Text className="font-inter text-base font-bold text-white">Done</Text>
    </TouchableOpacity>
  );

  const skipButton = ({ ...props }: any) => (
    <TouchableOpacity className="items-center justify-center rounded-[30px] bg-[#ccc] px-5 py-2.5" {...props}>
      <Text className="font-inter text-base font-bold text-white">Skip</Text>
    </TouchableOpacity>
  );

  const nextButton = ({ ...props }: any) => (
    <TouchableOpacity className="items-center justify-center rounded-[30px] bg-[#4A90E2] px-5 py-2.5" {...props}>
      <Text className="font-inter text-base font-bold text-white">Next</Text>
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
          backgroundColor: "#87ceeb",
          image: <BackgroundVideo source={require("../../assets/videos/v3_1.mp4")} />,
          title: "Welcome to Our App!",
          subtitle: "Learn more about our features in this onboarding experience.",
        },
        {
          backgroundColor: "#ff7f50",
          image: <BackgroundVideo source={require("../../assets/videos/v1.mp4")} />,
          title: "Stay Connected",
          subtitle: "Interact and stay connected with our community.",
        },
        {
          backgroundColor: "#ffe135",
          image: <BackgroundVideo source={require("../../assets/videos/v4_1.mp4")} />,
          title: "Get Notified",
          subtitle: "Receive instant notifications and stay updated.",
        },
        {
          backgroundColor: "#ffa280",
          image: <BackgroundVideo source={require("../../assets/videos/v2.mp4")} />,
          title: "Explore Features",
          subtitle: "Discover new functionalities tailored just for you.",
        },
        {
          backgroundColor: "#90ee90",
          image: <BackgroundVideo source={require("../../assets/videos/v5_2.mp4")} />,
          title: "Get Started!",
          subtitle: 'Tap "Done" to start using the app.',
        },
      ]}
      transitionAnimationDuration={300}
    />
  );
};

export default OnboardingScreen;
