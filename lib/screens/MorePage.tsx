import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar, Linking } from "react-native";
import { Ionicons, Feather, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";
import { useThemeStore } from "../stores/themeStore";
import { useAuthStore } from "../stores/authStore";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import ThemeToggle from "../components/ThemeToggle";
import ReactNativeModal from "react-native-modal";
import AppThemeSelectorScreen from "./AppThemeSelectorScreen";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
const { width, height } = Dimensions.get("window");
const data = [
  { source: require("../../assets/Pond_395.jpg") },
  { source: require("../../assets/Pond_048.jpg") },
  { source: require("../../assets/Pond_049.jpg") },
];

export default function MorePage() {
  const { isDarkmode, toggleDarkmode, accentColor } = useTheme();
  const resetTheme = useThemeStore((state) => state.reset);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("N/A");

  useEffect(() => {
    const name = user?.name;
    if (name) {
      setUserName(name);
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
  const handleVisitWebsite = () => {
    const websiteUrl = "https://www.wheresreligion.org";
    Linking.openURL(websiteUrl);
  };

  const onLogoutPress = async () => {
    try {
      await logout();
      resetTheme();
      router.replace("/(auth)/login");
    } catch (e) {
      console.log(e);
    }
  };

  const handleReportClick = () => {
    const email = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?";
    const body = "Please provide details of your issue you are facing here.";

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoLink).catch((err) => console.error("Error opening email client:", err));
  };

  const SettingOptions = ({ optionName, icon }: { optionName: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] | "none" }) => (
    <View
      className="h-[60px] flex-row justify-between items-center px-5 rounded-[10px] mt-[30px]"
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
  const MenuItem = ({ title, iconName, onPress }: { title: string; iconName: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between bg-white py-[18px] px-[30px] mb-3 rounded-[16px] w-[90%]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between w-[90%]">
        <Text className="font-inter text-sm font-medium text-black ml-[30px]">{title}</Text>
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
              className="flex-row justify-between items-center px-[10px] h-[50%]"
              style={{ marginTop: width > 500 ? "5%" : "15%", width }}
            >
              <View className="flex-row justify-between items-center" style={{ width: width > 500 ? "13%" : "27%" }}>
                <TouchableOpacity
                  className="rounded-full items-center justify-center bg-foreground ml-2"
                  style={{
                    width: width > 1000 ? 50 : 30,
                    height: width > 1000 ? 50 : 30,
                  }}
                  onPress={() => {
                    router.push("/account");
                  }}
                >
                  <Text className="font-inter font-semibold text-sm text-white self-center">{userInitials}</Text>
                </TouchableOpacity>
                <Text className="font-inter text-lg font-medium">More</Text>
              </View>
              <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} testID="dark-mode-toggle" />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ alignItems: "center", paddingBottom: 200 }}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center mt-5" style={{ height: width / 2 }}>
              <Carousel
                width={width}
                height={width / 2}
                data={data}
                renderItem={({ item }) => (
                  <Image source={item.source} className="w-[95%] h-full self-center rounded-[10px]" resizeMode="cover" />
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
                  message="Welcome to our more page! Here you can find settings, FAQ, logout, switch themes, and more!"
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
                <MenuItem title="Logout" iconName="exit-outline" onPress={onLogoutPress} />
              </View>
            </Tooltip>
          </ScrollView>
        </>
      ) : (
        <>
          <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
            <View
              className="flex-row justify-start items-center px-[10px] h-[50%]"
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
            <View className="justify-center items-center mt-[60px]">
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
            <View
              className="bg-white p-5 rounded-[10px] w-[90%]"
              style={{ height: height * 0.7 }}
            >
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
