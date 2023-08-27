import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import Accordion from "@gapur/react-native-accordion";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";

const user = User.getInstance();

export default function MorePage() {
  const handleEmail = () => {
    const emailAddress = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?'";
    const body = "Please provide details of your issue you are facing here.";

    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    Linking.openURL(emailUrl);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 300, width: "100%" }}>
        <Image
          source={require("../../assets/collegeChurch.jpg")}
          style={{
            flex: 1,
            width: undefined,
            height: undefined,
            resizeMode: "cover",
          }}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>Where's Religion?</Text>
        <Accordion headerTitleStyle={styles.headerText} headerTitle="Resources">
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
              )
            }
          ><Text style={styles.headerText}>{"\n"}{"\t"}Our Website{"\n"}</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://guides.library.upenn.edu/ethnography/DoingEthnography"
              )
            }
          ><Text style={styles.headerText}>{"\t"}Guide to Enthnography{"\n"}</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "http://changingminds.org/explanations/research/analysis/ethnographic_coding.htm"
              )
            }
          ><Text style={styles.headerText}>{"\t"}Guide to Coding{"\n"}</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEmail()}
          ><Text style={styles.headerText}>{"\t"}Report a Bug{"\n"}</Text></TouchableOpacity>
        </Accordion>
        <Accordion  headerTitleStyle={styles.headerText} headerTitle="Meet our Team">
            <Text>
              {'\n'}Insert Team Photo
            </Text>
            <Text>{'\n'}Insert Team Message</Text>
        </Accordion>
        <Accordion headerTitleStyle={styles.headerText} headerTitle="Frequently Asked Questions">
          <View style={styles.headerContainer}>
            <Accordion
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
      </View>
      <TouchableOpacity style={styles.logout} onPress={() => user.logout()}>
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name={"log-out-outline"} size={30} color="white" />
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  textContainer: {
    marginTop: 5,
    width: "100%",
  },
  titleText: {
    alignSelf: "center",
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 10,
  },
  headerContainer: {
    width: "100%",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "500",
  },
  text: {
    alignSelf: "center",
    fontSize: 16,
    lineHeight: 28,
  },
  logout: {
    flexDirection: "row",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: "80%",
    borderRadius: 20,
    marginTop: 120,
  },
  logoutText: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
    color: "white",
  },
});
