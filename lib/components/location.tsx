import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button } from "react-native";
import * as Location from "expo-location";

interface LocationProps {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  setLocation: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
    } | null>
  >;
}

async function getLocation() {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return null;
    }
    return await Location.getCurrentPositionAsync({});
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

export default function LocationWindow({ location, setLocation }: LocationProps) {
  const [latitude, setLatitude] = useState(location?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(location?.longitude?.toString() || "");
  const [distanceFromEvent, setDistanceFromEvent] = useState<string>("");
  const [isLocationShown, setIsLocationShown] = useState(true);

  useEffect(() => {
    setDistanceFromEvent("");
  }, [location]);

  const handleLatitudeChange = (newLatitude: string) => {
    setLatitude(newLatitude);
    setLocation((prevLocation) => ({
      latitude: parseFloat(newLatitude),
      longitude: prevLocation?.longitude ?? 0,
    }));
  };

  const handleLongitudeChange = (newLongitude: string) => {
    setLongitude(newLongitude);
    setLocation((prevLocation) => ({
      latitude: prevLocation?.latitude ?? 0,
      longitude: parseFloat(newLongitude),
    }));
  };

  useEffect(() => {
    setLatitude(location?.latitude?.toString() || "");
    setLongitude(location?.longitude?.toString() || "");
  }, [location]);

  const toggleLocationVisibility = async () => {
    if (isLocationShown) {
      setLocation({
        latitude: 0,
        longitude: 0,
      });
      setLatitude("0");
      setLongitude("0");
    } else {
      try {
        let userLocation = await getLocation();

        if (userLocation?.coords?.latitude !== undefined && userLocation?.coords?.longitude !== undefined) {
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });

          setLatitude(userLocation.coords.latitude.toString());
          setLongitude(userLocation.coords.longitude.toString());
        } else {
          console.log("Location data is not available.");
        }
      } catch (error) {
        console.error("Error setting location:", error);
      }
    }
    setIsLocationShown((prev) => !prev);
  };

  return (
    <View className="h-[210px] items-center justify-center p-5">
      <View className="absolute right-2.5 top-2.5 rounded-[5px] bg-white/50 p-[5px]">
        <Text className="font-inter text-sm font-bold text-black">{distanceFromEvent && location && distanceFromEvent.toString()}</Text>
      </View>
      <Text className="mb-[5px] font-inter text-lg font-bold">Longitude</Text>
      <TextInput
        className="h-10 w-full rounded-[5px] border border-[#ccc] px-2.5"
        value={longitude}
        onChangeText={handleLongitudeChange}
        editable={false}
      />
      <Text className="mb-[5px] font-inter text-lg font-bold">Latitude</Text>
      <TextInput
        className="h-10 w-full rounded-[5px] border border-[#ccc] px-2.5"
        value={latitude}
        onChangeText={handleLatitudeChange}
        editable={false}
      />
      <Button title={isLocationShown ? "Hide Location" : "Show Location"} onPress={toggleLocationVisibility} />
    </View>
  );
}
