import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
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
  const { theme, isDarkmode, toggleDarkmode } = useTheme();
  const dispatch = useDispatch();

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

  const onLogoutPress = async () => {
    try {
      await user.logout(dispatch);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headText, { color: theme.text }]}>About</Text>
      </View>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Where’s Religion?</Text>

            <Text style={styles.bodyText}>
              Where’s Religion? is an open-source mobile and desktop web application developed by humanities faculty and IT professionals at Saint Louis University that supports in-person research, remote data entry, media sharing, and mapping...
            </Text>
            
            <Text style={styles.bodyText}>
              We believe that it is time for our research methodologies in the humanities to catch up with the multisensory realities of human experience and that creating a platform for collecting, organizing, and sharing images, videos, and sounds...
            </Text>
            
            <Text style={styles.bodyText}>
              Being a tool that initiates engaged learning and in-person experience, we seek to build greater recognition of social dynamics and social context in American public life...
            </Text>
            
            <Text style={styles.bodyText}>
              Initiated in 2018, the Where’s Religion? is a keystone outcome of the Lived Religion in the Digital Age project at Saint Louis University...
            </Text>

            <View style={styles.buttonContainer}>
              <View style={[styles.switchContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.switchText, { color: theme.text }]}>Dark Mode</Text>
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

          <View style={[styles.logoutContainer, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              key="Logout"
              style={[
                styles.logout,
                {
                  backgroundColor: isDarkmode ? "white" : "black",
                },
              ]}
              onPress={onLogoutPress}
            >
              <Text
                style={[
                  styles.logoutText,
                  {
                    color: isDarkmode ? "black" : "white",
                  },
                ]}
              >
                Logout
              </Text>
              <Ionicons
                name={"log-out-outline"}
                size={30}
                color={isDarkmode ? "black" : "white"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: height * 0.02,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  headText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    paddingTop: 40,
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40, 
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
    color: "#000000",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  logout: {
    flexDirection: "row",
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: "80%",
    borderRadius: 15,
    marginTop: 40,
    marginBottom: 100,
  },
  logoutText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginRight: 10,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  switchContainer: {
    width: "94%",
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 6,
  },
  switchText: {
    color: "#000000",
    marginLeft: 9,
    fontSize: 18,
    fontWeight: "500",
  },
  logoutContainer: {
    backgroundColor: "#ffffff",
    width: "100%",
    alignItems: "center",
  },
});
