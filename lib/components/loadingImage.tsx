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
      <View style={{ width, height }} className="items-center justify-center">
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />}
          />
        )}
        {type === "video" ? (
          <View style={{ width, height }} className="items-center justify-center">
            <Image
              className="content-center self-center rounded-[10px]"
              style={{ width, height }}
              source={{ uri: imageURI }}
              onLoadEnd={() => setIsLoading(false)}
            />
            <View className="absolute h-[30px] w-[30px] self-center rounded-[30px] bg-black/50">
              <Ionicons name="play-outline" size={24} color="#dfe5e8" className="absolute ml-2.5 mt-[2px] self-center" />
            </View>
          </View>
        ) : (
          <View>
            <Image
              className="content-center self-center rounded-[10px]"
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
      <View style={{ width, height }} className="items-center justify-center">
        {isLoading && (
          <Placeholder
            style={{ top: width / 2 }}
            Animation={Progressive}
            Left={() => <PlaceholderMedia size={width} style={{ borderRadius: 10 }} />}
          />
        )}
        <Image
          className="content-center self-center rounded-[10px]"
          style={{ width, height }}
          source={require("./public/noPreview.png")}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
    );
  }
}
