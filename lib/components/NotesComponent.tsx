import React from "react";
import { View, Text, Dimensions } from "react-native";
import LoadingImage from "./loadingImage";
import { Note } from "../../types";

const { width, height } = Dimensions.get("window");

interface NotesComponentProps {
  IsImage: boolean;
  resolvedImageURI: string;
  ImageType: string;
  textLength: number;
  showTime: string;
  item: Note;
  isPublished: boolean;
  isDarkmode: boolean;
}

function NotesComponent({
  IsImage,
  resolvedImageURI,
  ImageType,
  textLength,
  showTime,
  item,
  isPublished,
  isDarkmode,
}: NotesComponentProps) {
  return (
    <View
      className="flex-row items-center rounded-sm bg-surface"
      style={{
        width: width > 1000 ? "97.5%" : "95%",
        margin: 10,
        height: height * 0.1,
        paddingHorizontal: height * 0.02,
      }}
    >
      {IsImage && resolvedImageURI ? (
        <View>
          <LoadingImage imageURI={resolvedImageURI} type={ImageType} isImage={true} height={70} width={100} />
        </View>
      ) : (
        <View>
          <LoadingImage imageURI={""} type={ImageType} isImage={false} height={70} width={100} />
        </View>
      )}

      <View className="ml-5 flex-wrap">
        <View className="h-[80%] justify-evenly">
          <Text className="font-inter text-foreground">
            {item.title.length > textLength ? item.title.slice(0, textLength) + "..." : item.title}
          </Text>

          <Text className="font-inter text-foreground">{showTime}</Text>
        </View>
      </View>
    </View>
  );
}

export default NotesComponent;
