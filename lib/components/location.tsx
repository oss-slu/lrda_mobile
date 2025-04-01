import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import * as Location from "expo-location";
import { defaultTextFont } from "../../styles/globalStyles";

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

function getDistanceFrom(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const distanceInMiles = distance * 0.621371;

  return distanceInMiles;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function LocationWindow({
  location,
  setLocation,
}: LocationProps) {
  const [latitude, setLatitude] = useState(
    location?.latitude?.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    location?.longitude?.toString() || ""
  );
  const [distanceFromEvent, setDistanceFromEvent] = useState<string>("");
  const [isLocationShown, setIsLocationShown] = useState(true);

  useEffect(() => {
    const updateDistance = async () => {
      const distance = await getDistance();
      setDistanceFromEvent(`${distance.toFixed(2)} Mi`);
    };
    updateDistance();
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
      // Hide Location
      setLocation({
        latitude: 0,
        longitude: 0,
      });
      setLatitude("0");
      setLongitude("0");
    } else {
      // Show Location
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
    <View style={styles.container}>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          {(distanceFromEvent && location) && distanceFromEvent.toString()}
        </Text>
      </View>
      <Text style={styles.label}>Longitude</Text>
      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={handleLongitudeChange}
        editable={false}
      />
      <Text style={styles.label}>Latitude</Text>
      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={handleLatitudeChange}
        editable={false}
      />
      <Button
        title={isLocationShown ? "Hide Location" : "Show Location"}
        onPress={toggleLocationVisibility}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 210,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  distanceContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 5,
    borderRadius: 5,
  },
  distanceText: {
    ...defaultTextFont,
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    ...defaultTextFont,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});
