import React, { useState, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import LoadingImage from "./loadingImage";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { fetchCreatorName } from "../utils/api_calls";
import { queryKeys } from "../query/queryKeys";
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
  const [address, setAddress] = useState<string | null>(null);

  const { data: author = "anonymous" } = useQuery({
    queryKey: queryKeys.users.name(item.creatorId),
    queryFn: () => fetchCreatorName(item.creatorId),
    enabled: !!item.creatorId,
    staleTime: Infinity,
  });

  const fetchAddress = async (latitude: number | null, longitude: number | null) => {
    const lat = typeof latitude === "number" ? latitude : NaN;
    const lon = typeof longitude === "number" ? longitude : NaN;

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
  }, [item]);

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
