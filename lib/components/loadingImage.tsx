import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Placeholder,
  PlaceholderMedia,
  ShineOverlay,
} from "rn-placeholder";

interface LoadingImageProps {
  imageURI: string,
  isImage: boolean,
}

export default function LoadingImage({imageURI, isImage}: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <View>
      {isImage ? (
        <View>
          {isLoading && (
            <Placeholder
              Animation={ShineOverlay}
              Left={() => (
                <PlaceholderMedia
                  size={100}
                  style={{ borderRadius: 10, marginRight: 20 }}
                />
              )}
            />
          )}
          <Image
            style={styles.preview}
            source={{ uri: imageURI }}
            onLoadEnd={() => setIsLoading(false)}
          />
        </View>
      ) : (
        <View>
          {isLoading && (
            <Placeholder
              Animation={ShineOverlay}
              Left={() => (
                <PlaceholderMedia
                  size={100}
                  style={{ borderRadius: 10, marginRight: 20 }}
                />
              )}
            />
          )}
          <Image
            style={styles.preview}
            source={require("./public/noPreview.png")}
            onLoadEnd={() => setIsLoading(false)}
          /> 
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: "10%",
    alignContent: "center",
    alignSelf: "center",
  },
});
