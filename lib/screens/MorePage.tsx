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
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headText, { color: theme.text }]}>About</Text>
      </View>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
          <View>
            <Text style={styles.body}>
 Where’s Religion? is an open-source mobile and desktop web application developed by humanities faculty and IT professionals at Saint Louis University that supports in-person research, remote data entry, media sharing, and mapping. To do this, the mobile app enables users to collect fieldnotes, image, video, and audio files – all of which are geotagged and timestamped. The desktop companion website/app provides a more feature-rich format to refine fieldnotes, edit media, or make new entries.. When published, entries are automatically curated online within an interactive public map that has search and filter functions for enhanced usability. Where’s Religion? is conceptualized and designed for students, researchers, and public users to document and share their encounters with “religion” in everyday life – all with the intended purpose of democratizing data collection and visualizing religious and cultural diversity at scale.</Text>
  
 <Text style={styles.body}>We believe that it is time for our research methodologies in the humanities to catch up with the multisensory realities of human experience and that creating a platform for collecting, organizing, and sharing images, videos, and sounds, along with textual notations, sourced from a wide range of users, is a necessary place to start. From this conviction, Where’s Religion? is conceptualized and designed for diverse users with interests in sharing media and notes about their respective encounters with “religion” in everyday places. We aim to raise the significance of embodied practices and shared spaces, facilitated through collected multimodal media products, to the study of religion, and to prompt data-driven investigation of  popular and disciplinary presumptions of what constitutes “religion.”</Text>
  
 <Text style={styles.body}> Being a tool that initiates engaged learning and in-person experience, we seek to build greater recognition of social dynamics and social context in American public life. The ethical use of technology is key here – one of the fundamental principles driving the purpose and design of Where’s Religion? As a mobile and desktop application, the idea is not only to appeal to casual users and students with the mobile app, but also to mimic an ethnographic-style workflow from out-in-the-field data collection to at-home editing and data refinement. Human subject research and place-based research are both critical skills for the modern, media-saturated world – skills that anyone wielding the power to record, to publish, to reach wide audiences within the palm of their hand should know. Where’s Religion? seeks not just to inform users of ethical human subject research and deepen cultural awareness, but to integrate app features and functions that prompt such consideration in real time through popup warnings, haptic feedback, curated information, or otherwise. This is not simply about gathering data, but rather about knowing when, where, and how to (or not to) gather data. Where’s Religion? is a ploy to deeply humanize the “data,” to unpack the ubiquitous media, to slow down and consider the image. Our digital tool therefore combines the computational methods of qualitative research software with an attentiveness to the nuances of “lived” religious life and practice. Our aim is to provide a free, intuitive, and compatible tool for ongoing research and classroom curriculum as well as a user-friendly method for assembling and studying digital media that curates “lived religion” across a diversity of people, places, and things.</Text>
  
 <Text style={styles.body}>Initiated in 2018, the Where’s Religion? is a keystone outcome of the Lived Religion in the Digital Age project at Saint Louis University. We have received external support from the Henry Luce Foundation ($400,000 in 2018 and $470,000 in 2022), and internal support from the College of Arts & Sciences, the Office for the Vice President for Research and the Research Computing Group, Open Source with SLU, the Walter J. Ong, S.J., Center for Digital Humanities, and the CREST Center.</Text>
           {/* <Text style={[styles.headerText, { color: theme.text }]}>Resources</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
                )
              }
            >
              <Text style={[styles.text, { color: theme.text }]}>Our Website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://guides.library.upenn.edu/ethnography/DoingEthnography"
                )
              }
            >
              <Text style={[styles.text, { color: theme.text }]}>Guide to Ethnography</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "http://changingminds.org/explanations/research/analysis/ethnographic_coding.htm"
                )
              }
            >
              <Text style={[styles.text, { color: theme.text }]}>Guide to Coding</Text>
            </TouchableOpacity>
            <TouchableOpacity key="Email" onPress={handleEmail}>
              <Text style={[styles.text, { color: theme.text }]}>Report a Bug</Text>
            </TouchableOpacity> */}

            <Text style={[styles.headerText, { color: theme.text }]}>Meet our Team</Text>
            <Text style={[styles.text, { color: theme.text }]}>Insert Team Photo</Text>
            <Text style={[styles.text, { color: theme.text }]}>Insert Team Message</Text>

            <Text style={[styles.headerText, { color: theme.text }]}>Frequently Asked Questions</Text>
          </View>

          <Text style={[styles.headerText, { color: theme.text }]}>What can users do?</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Explore religious traditions, find places of worship, engage in
            meaningful discussions.
          </Text>

          <Text style={[styles.headerText, { color: theme.text }]}>Who is it for?</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Scholars, students, believers, and the curious about the world's
            religions.
          </Text>

          <Text style={[styles.headerText, { color: theme.text }]}>What's unique?</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Provides a modern method to capture experiences using the devices
            that are with us every day.
          </Text>

          <Text style={[styles.headerText, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Connect people of diverse religious backgrounds, beliefs, and
            practices.
          </Text>

          <Text style={[styles.headerText, { color: theme.text }]}>Why use 'Where's Religion?'</Text>
          <Text style={[styles.text, { color: theme.text }]}>
            Explore religious traditions, find places of worship, engage in
            meaningful discussions.
          </Text>

          <View style={styles.textContainer}>
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
        backgroundColor: isDarkmode ? 'white' : 'black',
      },
    ]}
    onPress={onLogoutPress}
  >
    <Text
      style={[
        styles.logoutText,
        {
          color: isDarkmode ? 'black' : 'white',
        },
      ]}
    >
      Logout
    </Text>
    <Ionicons
      name={"log-out-outline"}
      size={30}
      color={isDarkmode ? 'black' : 'white'}
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
  body:{
    flex: 1,
    
  }
});

          