import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import LoadingImage from "./loadingImage";
import * as Location from "expo-location";
import ApiService from "../utils/api_calls";
import { defaultTextFont } from "../../styles/globalStyles";

const { width, height } = Dimensions.get("window");

function NotesComponent({ IsImage, resolvedImageURI, ImageType, textLength, showTime, item, isPublished, isDarkmode }) {
  const [address, setAddress] = useState(null);
  const [author, setAuthor] = useState("anonymous");

  const fetchUserName = async (creatorId: string) => {
    try {
      const name = await ApiService.fetchCreatorName(creatorId);
      setAuthor(name);
    } catch (error) {
      console.error("Failed to fetch creator name:", error);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    const lat = typeof latitude === "number" ? latitude : parseFloat(latitude);
    const lon = typeof longitude === "number" ? longitude : parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return;
    }

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

      if (result.length > 0) {
        const location = result[0];
        const formattedAddress = `${location.name || ""}, ${location.street || ""}, ${location.city || ""}, ${location.region || ""}, ${location.country || ""}`;
        setAddress(formattedAddress.trim());
      }
    } catch (error) {
      // silently fail
    }
  };

  useEffect(() => {
    fetchAddress(item.latitude, item.longitude);
    if (item.creatorId) {
      fetchUserName(item.creatorId);
    }
  }, [item]);

  return (
    <View style={[styles.notesContainer, { backgroundColor: isDarkmode ? "#3f3f3f" : "white" }]}>
      {IsImage && resolvedImageURI ? (
        <View>
          <LoadingImage imageURI={resolvedImageURI} type={ImageType} isImage={true} height={70} width={100} />
        </View>
      ) : (
        <View>
          <LoadingImage imageURI={""} type={ImageType} isImage={false} height={70} width={100} />
        </View>
      )}

      <View style={styles.notesTxtContent}>
        <View style={styles.columnData}>
          <Text style={[styles.noteTitle, { color: isDarkmode ? "#d9d9d9" : "black" }]}>
            {item.title.length > textLength ? item.title.slice(0, textLength) + "..." : item.title}
          </Text>

          <Text style={[styles.noteText, { color: isDarkmode ? "#d9d9d9" : "black" }]}>{showTime}</Text>
        </View>
      </View>
    </View>
  );
}

export default NotesComponent;

const styles = StyleSheet.create({
  notesContainer: {
    flexDirection: "row",
    width: width > 1000 ? "97.5%" : "95%",
    margin: 10,
    height: height * 0.1,
    alignItems: "center",
    paddingHorizontal: height * 0.02,
    borderRadius: 10,
  },
  noteTitle: {
    ...defaultTextFont,
  },
  noteText: {
    ...defaultTextFont,
  },

  notesTxtContent: {
    marginLeft: 20,
    flexWrap: "wrap",
  },
  columnData: {
    height: "80%",
    justifyContent: "space-evenly",
  },
});
