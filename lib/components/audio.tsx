import React, { useEffect, useState } from "react";
import { View, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function AudioContainer({
    newAudio,
    setNewAudio,
  }: {
    newImages: string[];
    setNewAudio: React.Dispatch<React.SetStateAction<string[]>>;
  }) {

    const handleNewAudio = () => {

    };

    const handleDeleteAudio = (index: any) => {
        const fit = index;
    };

    return (
        <View style={styles.container}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <TouchableOpacity onPress={handleNewAudio}>
              <Image style={styles.image} source={require("./public/microphone.jpg")} />
            </TouchableOpacity>
            <Image style={{height: 100, width: 200}} source={require("./public/waveform.jpg")}/>
          </ScrollView>
        </View>
      );
}

export default AudioContainer;

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      marginBottom: 10,
      width: "95%",
      justifyContent: "center",
    },
    image: {
      width: 50,
      height: 50,
      borderRadius: 20,
      marginRight: 10,
      marginTop: 25,
    },
    trash: {
      position: "absolute",
      zIndex: 99,
      height: "20%",
      width: "20%",
      backgroundColor: "red",
      borderRadius: 10,
      justifyContent: "center",
    },
  });
  