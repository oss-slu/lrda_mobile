import React from "react";
import { View, Text, Image, ImageStyle, Dimensions, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { MapMarker } from "../../types";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 170;
const CARD_WIDTH = width * 0.8;

interface MapNotesComponentProps {
  index: number;
  marker: MapMarker;
  onViewNote: (marker: MapMarker) => void;
}

export const MapNotesComponent = ({ index, marker, onViewNote }: MapNotesComponentProps) => {
  return (
    <View
      className="bg-surface dark:bg-[#222] rounded-lg mx-2.5 overflow-hidden justify-end elevation-2"
      style={{
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { width: 2, height: -2 },
      }}
      key={index}
    >
      {marker.images[0] && (
        <Image source={marker.images[0]} className="flex-[2] w-full h-full self-center" resizeMode="cover" />
      )}
      <View
        className="flex-row flex-[2] p-2.5 absolute border border-white/20 justify-evenly"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          width: CARD_WIDTH,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 5,
        }}
      >
        <View className="w-[70%]">
          <Text numberOfLines={1} className="font-inter text-xs font-bold text-white">
            {marker.title || "Untitled"}
          </Text>
          <Text numberOfLines={1} className="font-inter text-xs text-white">
            {(typeof marker.description === "string" ? marker.description : "No description available")
              .replace(/<[^>]+>/g, "")
              .substring(0, 200)
              .trim()}
          </Text>
        </View>

        <View className="items-center mt-[5px] w-[30%]">
          <TouchableOpacity onPress={() => onViewNote(marker)}>
            <View className="flex-row justify-between items-center w-full">
              <FontAwesome6 name="arrow-right-long" size={20} color={"white"} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
