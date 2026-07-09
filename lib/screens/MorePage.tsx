import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar, Linking } from "react-native";
import { Ionicons, Feather, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";
import { useAuthStore } from "../stores/authStore";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import ThemeToggle from "../components/ThemeToggle";
import ReactNativeModal from "react-native-modal";
import AppThemeSelectorScreen from "./AppThemeSelectorScreen";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { TAB_BAR_HEIGHT } from "../constants";
const { width, height } = Dimensions.get("window");
const data = [
  { source: require("../../assets/Pond_395.jpg") },
  { source: require("../../assets/Pond_048.jpg") },
  { source: require("../../assets/Pond_049.jpg") },
];

export default function MorePage() {
  const { isDarkmode, toggleDarkmode, accentColor } = useTheme();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("N/A");

  useEffect(() => {
    const name = user?.name;
    if (name) {
      const initials = name
        .split(" ")
        .map((namePart) => namePart[0])
        .join("");
      setUserInitials(initials);
    }
  }, [user]);

  const handleThemeOpen = () => {
    setIsThemeOpen(!isThemeOpen);
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  const handleReportClick = () => {
    const email = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?";
    const body = "Please provide details of your issue you are facing here.";

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoLink).catch((err) => console.error("Error opening email client:", err));
  };

  const SettingOptions = ({
    optionName,
    icon,
  }: {
    optionName: string;
    icon: React.ComponentProps<typeof MaterialIcons>["name"] | "none";
  }) => (
    <View
      className="mt-[30px] h-[60px] flex-row items-center justify-between rounded-[10px] px-5"
      style={{
        width: width * 0.8,
        backgroundColor: "#e5e8e5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      }}
    >
      <Text className={`font-inter text-sm font-medium ${icon === "delete" ? "text-red-500" : "text-black"}`}>{optionName}</Text>
      {icon === "none" ? (
        <View className="h-[25px] w-[25px] rounded-full border-[0.5px]" style={{ backgroundColor: accentColor }} />
      ) : (
        <MaterialIcons name={icon} size={25} color={icon === "delete" ? "red" : "black"} />
      )}
    </View>
  );
  const MenuItem = ({
    title,
    iconName,
    onPress,
    testID,
  }: {
    title: string;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
    onPress: () => void;
    testID?: string;
  }) => (
    <TouchableOpacity
      testID={testID}
      className="mb-3 w-[90%] flex-row items-center justify-between rounded-[16px] bg-white px-[30px] py-[18px]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <View className="w-[90%] flex-row items-center justify-between">
        <Text className="ml-[30px] font-inter text-sm font-medium text-black">{title}</Text>
        <Ionicons name={iconName} size={28} color={"black"} />
      </View>
    </TouchableOpacity>
  );

  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  const [morePageTip, setMorePageTip] = useState<boolean>(false);

  useEffect(() => {
    getHasDoneTutorial("MorePage").then((tutorialDone: boolean) => {
      setUserTutorial(tutorialDone);
      if (!tutorialDone) {
        setMorePageTip(true);
      }
    });
  }, []);

  return (
    <View className="flex-1">
      <StatusBar translucent backgroundColor="transparent" />

      {!isSettingsOpen ? (
        <>
          <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
            <View
              className="h-[50%] flex-row items-center justify-between px-[10px]"
              style={{ marginTop: width > 500 ? "5%" : "15%", width }}
            >
              <View className="flex-row items-center justify-between" style={{ width: width > 500 ? "13%" : "27%" }}>
                <TouchableOpacity
                  testID="profile-button"
                  className="ml-2 items-center justify-center rounded-full bg-foreground"
                  style={{
                    width: width > 1000 ? 50 : 30,
                    height: width > 1000 ? 50 : 30,
                  }}
                  onPress={() => {
                    router.push("/account");
                  }}
                >
                  <Text className="self-center font-inter text-sm font-semibold text-white">{userInitials}</Text>
                </TouchableOpacity>
                <Text className="font-inter text-lg font-medium">More</Text>
              </View>
              <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} testID="dark-mode-toggle" />
            </View>
          </View>

          <ScrollView
            style={{ marginBottom: TAB_BAR_HEIGHT }}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <View className="mt-5 items-center" style={{ height: width / 2 }}>
              <Carousel
                width={width}
                height={width / 2}
                data={data}
                renderItem={({ item }) => (
                  <Image source={item.source} className="h-full w-[95%] self-center rounded-[10px]" resizeMode="cover" />
                )}
                autoPlay
                autoPlayInterval={3000}
                scrollAnimationDuration={800}
              />
            </View>

            <Tooltip
              isVisible={morePageTip && !userTutorial}
              showChildInTooltip={false}
              topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
              content={
                <TooltipContent
                  message="Welcome to our more page! Here you can find settings, FAQ, switch themes, and more!"
                  onPressOk={() => {
                    setUserTutorial(true);
                    setMorePageTip(false);
                    setTutorialDone("MorePage", true);
                  }}
                  onSkip={() => {
                    setUserTutorial(true);
                    setMorePageTip(false);
                    setTutorialDone("MorePage", true);
                  }}
                />
              }
              placement="top"
            >
              <View className="mt-10 items-center">
                <MenuItem
                  title="About"
                  iconName="information-circle-outline"
                  onPress={() => {
                    router.push("/more/about");
                  }}
                />
                <MenuItem title="Resource" iconName="link-outline" onPress={() => router.push("/more/resource")} />
                <MenuItem title="Meet our team" iconName="people-outline" onPress={() => router.push("/more/team")} />
                <MenuItem title="Settings" iconName="settings-outline" onPress={handleSettingsToggle} />
                <MenuItem title="FAQ" iconName="help-circle-outline" onPress={() => {}} />
              </View>
            </Tooltip>
          </ScrollView>
        </>
      ) : (
        <>
          <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
            <View
              className="h-[50%] flex-row items-center justify-start px-[10px]"
              style={{ marginTop: width > 500 ? "4%" : "15%", width }}
            >
              <TouchableOpacity onPress={handleSettingsToggle}>
                <Feather name={"arrow-left"} size={30} />
              </TouchableOpacity>
              <View className="ml-5" testID="settings-header">
                <Text className="font-inter text-[17px] font-bold">Settings</Text>
              </View>
            </View>
          </View>
          <ScrollView>
            <View className="mt-[60px] items-center justify-center">
              <TouchableOpacity onPress={handleThemeOpen}>
                <SettingOptions optionName={"App Theme"} icon={"none"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReportClick}>
                <SettingOptions optionName={"Report an Issue"} icon={"report"} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <ReactNativeModal
            isVisible={isThemeOpen}
            backdropColor="#00aa00"
            backdropOpacity={0}
            style={{ margin: 0, justifyContent: "center", alignItems: "center", top: "20%" }}
          >
            <View className="w-[90%] rounded-[10px] bg-white p-5" style={{ height: height * 0.7 }}>
              <View className="flex-row justify-between">
                <Text className="font-inter text-lg font-semibold">Customize your app</Text>

                <TouchableOpacity onPress={handleThemeOpen} testID="close-app-theme-modal">
                  <Entypo name={"cross"} size={30} />
                </TouchableOpacity>
              </View>
              <AppThemeSelectorScreen />
            </View>
          </ReactNativeModal>
        </>
      )}
    </View>
  );
}
