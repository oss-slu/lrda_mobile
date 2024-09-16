import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Switch
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { useTheme } from "../components/ThemeProvider";
import { useDispatch } from "react-redux";

const user = User.getInstance();
const { width, height } = Dimensions.get("window");

export default function MorePage() {
  // Destructuring `toggleDarkmode` and `isDarkmode` from useTheme
  const { theme, isDarkmode, toggleDarkmode } = useTheme();

  // Use the Redux dispatch for logging out
  const dispatch = useDispatch();

  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode(); // Ensure this is a valid function
    }
  };

  const handleEmail = () => {
    const emailAddress = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?'";
    const body = "Please provide details of your issue you are facing here.";

    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(emailUrl);
  };

  const onLogoutPress = async () => {
    try {
      await user.logout(dispatch);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headText}>Where's Religion</Text>
      </View>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{ height: 300, width: "100%" }}>
            <Image
              source={require("../../assets/collegeChurch.jpg")}
              style={styles.image}
            />
          </View>

          <View>
            <Text style={styles.headerText}>Resources</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
                )
              }
            >
              <Text style={styles.text}>Our Website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://guides.library.upenn.edu/ethnography/DoingEthnography"
                )
              }
            >
              <Text style={styles.text}>Guide to Ethnography</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "http://changingminds.org/explanations/research/analysis/ethnographic_coding.htm"
                )
              }
            >
              <Text style={styles.text}>Guide to Coding</Text>
            </TouchableOpacity>
            <TouchableOpacity key="Email" onPress={handleEmail}>
              <Text style={styles.text}>Report a Bug</Text>
            </TouchableOpacity>

            <Text style={styles.headerText}>Meet our Team</Text>
            <Text style={styles.text}>Insert Team Photo</Text>
            <Text style={styles.text}>Insert Team Message</Text>

            <Text style={styles.headerText}>Frequently Asked Questions</Text>
          </View>

          <Text style={styles.headerText}>What can users do?</Text>
          <Text style={styles.text}>
            Explore religious traditions, find places of worship, engage in
            meaningful discussions.
          </Text>

          <Text style={styles.headerText}>Who is it for?</Text>
          <Text style={styles.text}>
            Scholars, students, believers, and the curious about the world's
            religions.
          </Text>

          <Text style={styles.headerText}>What's unique?</Text>
          <Text style={styles.text}>
            Provides a modern method to capture experiences using the devices
            that are with us every day.
          </Text>

          <Text style={styles.headerText}>Our Mission</Text>
          <Text style={styles.text}>
            Connect people of diverse religious backgrounds, beliefs, and
            practices.
          </Text>

          <Text style={styles.headerText}>Why use 'Where's Religion?'</Text>
          <Text style={styles.text}>
            Explore religious traditions, find places of worship, engage in
            meaningful discussions.
          </Text>

          <View style={styles.textContainer}>
            <View style={styles.buttonContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Dark Mode</Text>
                <Switch
                  testID="dark-mode-switch"
                  trackColor={{
                    false: "black",
                    true: theme.text,
                  }}
                  thumbColor={theme.primaryColor}
                  onValueChange={handleToggleDarkMode}
                  value={isDarkmode}
                />
              </View>
            </View>
          </View>
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              key="Logout"
              style={styles.logout}
              onPress={onLogoutPress}
            >
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons
                name={"log-out-outline"}
                size={30}
                color={theme.primaryColor}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// All styles moved to the bottom
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    padding: height * 0.01,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.04,
    marginBottom: -8,
  },
  headText: {
    fontSize: 32,
    fontWeight: "bold",
    color: '#000000',
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  textContainer: {
    width: "100%",
    paddingTop: 15,
  },
  titleText: {
    alignSelf: "center",
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 10,
    color: '#000000',
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: '#000000',
    alignSelf: "center",
  },
  text: {
    alignSelf: "center",
    fontSize: 16,
    lineHeight: 28,
    color: '#000000',
  },
  logout: {
    flexDirection: "row",
    backgroundColor: '#ff0000',
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: "80%",
    borderRadius: 15,
    marginTop: 60,
    marginBottom: 100,
  },
  logoutText: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 20,
    fontWeight: "600",
    color: '#ffffff',
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  switchContainer: {
    width: "94%",
    backgroundColor: '#f0f0f0',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 6,
  },
  switchText: {
    color: '#000000',
    marginLeft: 9,
    fontSize: 18,
    fontWeight: "500",
  },
  logoutContainer: {
    backgroundColor: '#ffffff',
    width: "100%",
    alignItems: "center",
  },
  image: {
    flex: 1,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
  },
});
/*  Line 155
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Resources">
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
                )}
              ><Text style={styles.headerText}>{"\n"}{"\t"}Our Website{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "https://guides.library.upenn.edu/ethnography/DoingEthnography"
                )}
              ><Text style={styles.headerText}>{"\t"}Guide to Enthnography{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "http://changingminds.org/explanations/research/analysis/ethnographic_coding.htm"
                )}
              ><Text style={styles.headerText}>{"\t"}Guide to Coding{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEmail()}
              ><Text style={styles.headerText}>{"\t"}Report a Bug{"\n"}</Text></TouchableOpacity>
            </Accordion>
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Meet our Team">
              <Text style={{ color: theme.text }}>
                {'\n'}Insert Team Photo
              </Text>
              <Text style={{ color: theme.text }}>{'\n'}Insert Team Message</Text>
            </Accordion>
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Frequently Asked Questions">
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="What can users do?"
                >
                  <Text style={styles.text}>
                    Explore religious traditions, find places of worship, engage in
                    meaningful discussions.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Who is it for?"
                >
                  <Text style={styles.text}>
                    Scholars, students, believers, and the curious about the world's
                    religions.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="What's unique?"
                >
                  <Text style={styles.text}>
                    Provides a modern method to capture experiences using the
                    devices that are with us every day.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Our Mission"
                >
                  <Text style={styles.text}>
                    Connect people of diverse religious backgrounds, beliefs, and
                    practices.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Why use 'Where's Religion?'"
                >
                  <Text style={styles.text}>
                    Explore religious traditions, find places of worship, engage in
                    meaningful discussions.
                  </Text>
                </Accordion>
              </View>
            </Accordion>

            */