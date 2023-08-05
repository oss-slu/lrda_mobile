import React from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

export default function MorePage() {
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
        <Text style={styles.titleText}>Welcome to Where's Religion?</Text>
        <Text style={styles.text}>
          Where's Religion? is a groundbreaking application designed to bring
          ethnography into the modern era. Our mission is to provide a platform
          that connects people across various religious backgrounds, beliefs,
          and practices.{"\n\n"}
          With Where's Religion?, users can explore different religious
          traditions, find nearby places of worship, engage in meaningful
          discussions, and much more. Whether you are a scholar, student, a
          believer, or simply curious about the world's religions, this app
          offers a unique and comprehensive insight into the diverse spiritual
          landscape of our time.{"\n\n"}
          Thank you for downloading and allowing us to be part of your journey!
        </Text>
      </View>
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
    width: "90%",
  },
  titleText: {
    alignSelf: "center",
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 10,
  },
  text: {
    alignSelf: "center",
    fontSize: 20,
    lineHeight: 28,
  },
});
