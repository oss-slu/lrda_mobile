import React, { useState } from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Placeholder, PlaceholderMedia, Progressive } from "rn-placeholder";

interface LoadingImageProps {
  imageURI: string;
  type: string;
  isImage: boolean;
  height?: number;
  width?: number;
}

export default function LoadingImage({ imageURI, type, isImage, height = 70, width = 100 }: LoadingImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (isImage && imageURI !== "") {
    return (
      <View style={{ width, height }} className="justify-center items-center">
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />}
          />
        )}
        {type === "video" ? (
          <View style={{ width, height }} className="justify-center items-center">
            <Image
              className="rounded-[10px] content-center self-center"
              style={{ width, height }}
              source={{ uri: imageURI }}
              onLoadEnd={() => setIsLoading(false)}
            />
            <View className="w-[30px] h-[30px] rounded-[30px] bg-black/50 absolute self-center">
              <Ionicons name="play-outline" size={24} color="#dfe5e8" className="absolute self-center ml-2.5 mt-[2px]" />
            </View>
          </View>
        ) : (
          <View>
            <Image
              className="rounded-[10px] content-center self-center"
              style={{ width, height }}
              source={{ uri: imageURI }}
              onLoadEnd={() => setIsLoading(false)}
            />
          </View>
        )}
      </View>
    );
  } else {
    return (
      <View style={{ width, height }} className="justify-center items-center">
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />}
          />
        )}
        <Image
          className="rounded-[10px] content-center self-center"
          style={{ width, height }}
          source={require("./public/noPreview.png")}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    );
  }
}
