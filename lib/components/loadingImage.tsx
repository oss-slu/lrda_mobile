import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Placeholder, PlaceholderMedia, Progressive } from "rn-placeholder";

interface LoadingImageProps {
  imageURI: string;
  type: string;
  isImage: boolean;
  useCustomDimensions?: boolean,
  customWidth?: number;
  customHeight?: number;
}

export default function LoadingImage({
  imageURI,
  type,
  isImage,
  useCustomDimensions = false,
  customWidth = 100,
  customHeight = 100,

}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const initialDimensions = useCustomDimensions
    ? { width: customWidth, height: customHeight }
    : { width: 100, height: 100 };
  const [dimensions, setDimensions] = useState(initialDimensions);

  const handleImageLoaded = (event: { nativeEvent: { source: { width: any; height: any; }; }; }) => {
    if (!useCustomDimensions) {
      const { width, height } = event.nativeEvent.source;
      setDimensions({ width, height });
    }
    setIsLoading(false);
  }

  if (isImage && imageURI !== "") {
    return (
      <View
        style={{
          ...dimensions,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading && (
          <Placeholder
            Animation={Progressive}
            Left={() => (
              <PlaceholderMedia size={Math.min(dimensions.width, dimensions.height)} style={{ borderRadius: 10 }} />
            )}
          />
        )}
        <Image
          style={[styles.preview, dimensions]}
          source={{ uri: imageURI }}
          onLoad={handleImageLoaded}
        />
        {type === "video" && (
          <View style={[styles.playUnderlay, { width: 30, height: 30 }]}>
            <Ionicons
              name="play-outline"
              size={24}
              color="#fff"
              style={styles.icon}
            />
          </View>
        )}
      </View>
    );
  } else {
    return (
      <View
        style={{
          ...dimensions,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isLoading && (
          <Placeholder
            Animation={Progressive}
            Left={() => (
              <PlaceholderMedia size={Math.min(dimensions.width, dimensions.height)} style={{ borderRadius: 10 }} />
            )}
          />
        )}
        <Image
          style={[styles.preview, dimensions]}
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
  },
  icon: {
    position: "absolute",
    alignSelf: "center",
  },
  playUnderlay: {
    borderRadius: 30,
    backgroundColor: "rgba(5,5,5,0.5)",
    position: "absolute",
    justifyContent: 'center',
    alignItems: 'center',
  },
});