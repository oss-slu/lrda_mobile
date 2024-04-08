import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Placeholder, PlaceholderMedia, Progressive } from "rn-placeholder";

interface LoadingImageProps {
  imageURI: string;
  type: string;
  isImage: boolean;
  height?: number;
  width?: number;
}

export default function LoadingImage({
  imageURI,
  type,
  isImage,
  height = 100,
  width = 100,
}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (isImage && imageURI !== "") {
    return (
      <View
        style={{
          width: width,
          height: height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => (
              <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />
            )}
          />
        )}
        {type === "video" ? (
          <View
            style={{
              width: width,
              height: height,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={[styles.preview, { width: width, height: height }]}
              source={{ uri: imageURI }}
              onLoadEnd={() => setIsLoading(false)}
            />
            <View style={styles.playUnderlay}>
              <Ionicons
                name="play-outline"
                size={24}
                color="#dfe5e8"
                style={styles.icon}
              />
            </View>
          </View>
        ) : (
          <View>
            <Image
              style={[styles.preview, { width: width, height: height }]}
              source={{ uri: imageURI }}
              onLoadEnd={() => setIsLoading(false)}
            />
          </View>
        )}
      </View>
    );
  } else {
    return (
      <View
        style={{
          width: width,
          height: height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => (
              <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />
            )}
          />
        )}
        <Image
          style={[styles.preview, { width: width, height: height }]}
          source={require("./public/noPreview.png")}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: 10,
    alignContent: "center",
    alignSelf: "center",
  },
  icon: {
    position: "absolute",
    alignSelf: "center",
    marginLeft: 10,
    marginTop: 2,
  },
  playUnderlay: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "rgba(5,5,5,0.5)",
    position: "absolute",
    alignSelf: "center",
  },
});