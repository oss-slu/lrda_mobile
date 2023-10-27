import React, { useContext, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Switch
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { useTheme } from "../../lib/components/ThemeProvider";
import Accordion from "@gapur/react-native-accordion";

const user = User.getInstance();
const { width, height } = Dimensions.get("window");

export default function MorePage() {

  const { theme, isDarkmode, setIsDarkmode } = useTheme();

  const toggleDarkmode = useTheme().toggleDarkmode;
  const handleToggleDarkMode = () => {
    toggleDarkmode(); 
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

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.primaryColor,
      padding: height * 0.01,
      justifyContent: "center",
      alignItems: "center",
      marginTop: height * 0.04,
      marginBottom: -8,
    },
    headText: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.text,
    },
    container: {
      flexGrow: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      color: theme.primaryColor,
    },
    textContainer: {
      width: "100%",
      backgroundColor: theme.primaryColor,
    },
    titleText: {
      alignSelf: "center",
      fontSize: 40,
      fontWeight: "600",
      marginBottom: 10,
      color: theme.text,
    },
    headerContainer: {
      width: "100%",
      color: theme.text,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "500",
      color: theme.text,
    },
    text: {
      alignSelf: "center",
      fontSize: 16,
      lineHeight: 28,
      color: theme.text,
    },
    logout: {
      flexDirection: "row",
      backgroundColor: theme.logout,
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
      maxWidth: "100%",
      color: theme.logoutText,
    },
    buttonContainer: {
      alignItems: "center",
      marginTop: 12,
    },
    switch: {
      width: "94%",
      backgroundColor: "white",
      padding: 12,
      borderRadius: 10,
      justifyContent: "space-between"
    },
    switchText: {
      color: theme.text,
      marginLeft: 9,
      fontSize: 18,
      fontWeight: "500",
    },
    switchContainer: {
      width: "94%",
      backgroundColor: theme.secondaryColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: "space-between",
      borderRadius: 10,
      padding: 6,
    },
  });

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
              style={{
                flex: 1,
                width: undefined,
                height: undefined,
                resizeMode: "cover",
              }} />
          </View>
          <View style={styles.textContainer}>
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
            <View style={styles.buttonContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Dark Mode</Text>
                <Switch
                  trackColor={{
                    false: 'black',
                    true: theme.text
                  }}
                  thumbColor={theme.primaryColor}
                  onValueChange={handleToggleDarkMode}
                  value={isDarkmode}
                />
            </View>
          </View>
          </View>
          <View style = {{ backgroundColor: theme.primaryColor , width: '100%', alignItems: 'center'}}>
            <TouchableOpacity style={styles.logout} onPress={() => user.logout()}>
              <Text style={styles.logoutText}>Logout</Text>
              <Ionicons name={"log-out-outline"} size={30} color={theme.primaryColor} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView></>
  );
}