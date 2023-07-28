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

export default function LocationWindow({ location, setLocation }: LocationProps) {
    const [latitude, setLatitude] = useState(location?.latitude?.toString() || "");
    const [longitude, setLongitude] = useState(location?.longitude?.toString() || "");
  
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
  
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          return;
        }
  
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
        // Set latitude and longitude state variables
        setLatitude(userLocation.coords.latitude.toString());
        setLongitude(userLocation.coords.longitude.toString());
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={handleLongitudeChange}
        />
        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={latitude}
          onChangeText={handleLatitudeChange}
        />
        <Button title="Use Current Location" onPress={getLocation} />
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  label: {
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
