import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, Platform, StatusBar, Linking } from "react-native";
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
import { defaultTextFont } from "../../styles/globalStyles";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
const { width, height } = Dimensions.get("window");
const data = [
  { source: require("../../assets/Pond_395.jpg") },
  { source: require("../../assets/Pond_048.jpg") },
  { source: require("../../assets/Pond_049.jpg") },
];

export default function MorePage() {
  const { theme, isDarkmode, toggleDarkmode } = useTheme();
  const clearTheme = useThemeStore((state) => state.clearTheme);
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
  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode();
    }
  };

  const handleEmail = () => {
    const emailAddress = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?'";
    const body = "Please provide details of your issue you are facing here.";
    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(emailUrl);
  };

  const handleVisitWebsite = () => {
    const websiteUrl = "https://www.wheresreligion.org";
    Linking.openURL(websiteUrl);
  };

  const onLogoutPress = async () => {
    try {
      await logout();
      clearTheme();
      router.replace("/(auth)/login");
    } catch (e) {
      console.log(e);
    }
  };

  const handleReportClick = () => {
    const email = "yashkamal.bhatia@slu.edu"; // The predefined email address
    const subject = "Bug Report on 'Where's Religion?"; // The subject of the email
    const body = "Please provide details of your issue you are facing here."; // The body of the email

    // Create the mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the email client
    Linking.openURL(mailtoLink).catch((err) => console.error("Error opening email client:", err));
  };

  const SettingOptions = ({ optionName, icon }: { optionName: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] | "none" }) => (
    <View
      style={{
        height: 60,
        width: width * 0.8,
        backgroundColor: "#e5e8e5",
        shadowColor: "#000", // Shadow color
        shadowOffset: { width: 0, height: 4 }, // Shadow offset for depth
        shadowOpacity: 0.1, // Subtle shadow opacity
        shadowRadius: 6, // Blur for the shadow
        marginTop: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 10,
      }}
    >
      <Text style={{ ...defaultTextFont, fontSize: 14, fontWeight: "500", color: icon === "delete" ? "red" : "black" }}>{optionName}</Text>
      {icon === "none" ? (
        <View style={{ height: 25, width: 25, backgroundColor: theme.homeColor, borderRadius: 50, borderWidth: 0.5 }}></View>
      ) : (
        <MaterialIcons name={icon} size={25} color={icon === "delete" ? "red" : "black"} />
      )}
    </View>
  );
  const MenuItem = ({ title, iconName, onPress }: { title: string; iconName: React.ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuContent}>
        <Text style={[styles.menuText, { fontSize: 14, fontWeight: "500" }]}>{title}</Text>
        <Ionicons name={iconName} size={styles.menuIcon.fontSize} color={"black"} />
      </View>
    </TouchableOpacity>
  );

  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  // Initialize libraryTip as false (not active) by default.
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
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />

      {!isSettingsOpen ? (
        <>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
            <View style={styles.headerContent}>
              <View style={styles.userAccountAndPageTitle}>
                <TouchableOpacity
                  style={[
                    styles.userPhoto,
                    {
                      backgroundColor: theme.black,
                      width: width > 1000 ? 50 : 30,
                      height: width > 1000 ? 50 : 30,
                    },
                  ]}
                  onPress={() => {
                    router.push("/account");
                  }}
                >
                  <Text style={styles.pfpText}>{userInitials}</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>More</Text>
              </View>
              <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} testID="dark-mode-toggle" />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[styles.menuContainer, { paddingBottom: 200 }]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {/* Carousel */}

            <View style={styles.carouselContainer}>
              <Carousel
                width={width}
                height={width / 2}
                data={data}
                renderItem={({ item }) => <Image source={item.source} style={styles.bannerImage} />}
                autoPlay
                autoPlayInterval={3000}
                scrollAnimationDuration={800}
              />
            </View>

            {/* Menu Items */}
            <Tooltip
              isVisible={morePageTip && !userTutorial}
              showChildInTooltip={false} // Changed from false to true
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
              <View style={{ marginTop: 40, alignItems: "center" }}>
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
          {/** header content starts here */}
          <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
            <View style={styles.settingsHeaderContent}>
              <TouchableOpacity onPress={handleSettingsToggle}>
                <Feather name={"arrow-left"} size={30} />
              </TouchableOpacity>
              <View style={styles.headerHeading} testID="settings-header">
                <Text style={{ ...defaultTextFont, fontSize: 17, fontWeight: "bold" }}>Settings</Text>
              </View>
            </View>
          </View>
          {/** header content ends here */}
          <ScrollView>
            <View style={{ justifyContent: "center", alignItems: "center", marginTop: 60 }}>
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
            style={{ margin: 0, justifyContent: "center", alignItems: "center", top: "20%" }} // Center the modal
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                height: height * 0.7, // Restrict modal height to 70% of the screen
                width: "90%", // Set the width to 90% of the screen
              }}
            >
              <View style={styles.headingAndAction}>
                <Text style={styles.heading}>Customize your app</Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    height: width > 500 ? height * 0.12 : height * 0.19,
  },
  profile: { flexDirection: "row", alignItems: "center" },
  userAccountAndPageTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width > 500 ? "13%" : "27%",
  },
  userPhoto: {
    height: width * 0.095,
    width: width * 0.095,
    borderRadius: 50,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: "black",
    marginLeft: 8,
  },
  pfpText: {
    ...defaultTextFont,
    fontWeight: "600",
    fontSize: 14,
    alignSelf: "center",
    color: "white",
  },
  pageTitle: {
    ...defaultTextFont,
    fontSize: 18,
    fontWeight: "500",
  },
  bannerImage: {
    width: "95%",
    height: "100%",
    resizeMode: "cover",
    alignSelf: "center",
    borderRadius: 10, // Rounded corners
  },
  carouselContainer: {
    alignItems: "center",
    height: width / 2,
    marginTop: 20,
  },
  menuContainer: {
    alignItems: "center",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Space text and icon
    backgroundColor: "#fff", // Button background
    paddingVertical: 18, // Increase button height
    paddingHorizontal: 30, // Increase horizontal padding for both sides
    marginBottom: 12, // Space between buttons
    borderRadius: 16, // Smooth rounded corners
    width: "90%", // Full width for buttons
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for depth
    shadowOpacity: 0.1, // Subtle shadow opacity
    shadowRadius: 6, // Blur for the shadow
    elevation: 5, // Android shadow effect
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%", // Ensure full width usage
  },
  menuText: {
    ...defaultTextFont,
    fontSize: 20, // Larger text size
    fontWeight: "bold", // Bold text
    color: "#000", // Black text color
    marginLeft: 30, // Additional space on the left of text
  },
  menuIcon: {
    ...defaultTextFont,
    fontSize: 28, // Icon size for visual balance
  },

  settingsHeader: {
    height: height * 0.15,
  },
  headerContent: {
    marginLeft: 0,
    marginTop: width > 500 ? "5%" : "15%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    width: width,
    height: "50%",
  },
  headerHeading: {
    marginLeft: 20,
  },

  settingsHeaderContent: {
    marginLeft: 0,
    marginTop: width > 500 ? "4%" : "15%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    width: width,
    height: "50%",
  },
  heading: {
    ...defaultTextFont,
    fontSize: 18,
    fontWeight: "600",
  },
  headingAndAction: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  switchText: { ...defaultTextFont, fontSize: 18, fontWeight: "500" },
  logout: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: "90%",
    borderRadius: 15,
    marginTop: 10,
  },
  logoutText: { ...defaultTextFont, fontSize: 20, fontWeight: "600", marginRight: 10 },
});
