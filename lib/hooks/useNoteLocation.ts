import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

export interface NoteCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Device location for the note editor screens. Fetches the current position
 * silently on mount; (0,0) means location tagging is turned off.
 */
export function useNoteLocation(initial?: NoteCoordinates | null) {
  const [location, setLocation] = useState<NoteCoordinates | null>(initial ?? null);

  const setLocationToZero = useCallback(() => {
    setLocation({ latitude: 0, longitude: 0 });
  }, []);

  // silent: skip the error alert for automatic fetches (e.g. on mount), where it
  // can fire after the user has already navigated away.
  const fetchCurrentLocation = useCallback(
    async ({ silent = false } = {}) => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        try {
          const userLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });
        } catch (error) {
          console.error("Error fetching location:", error);
          if (!silent) {
            Alert.alert("Error", "Failed to retrieve location.");
          }
          setLocationToZero();
        }
      } else {
        setLocationToZero();
      }
    },
    [setLocationToZero]
  );

  useEffect(() => {
    fetchCurrentLocation({ silent: true });
  }, [fetchCurrentLocation]);

  const isLocationOff = location !== null && location.latitude === 0 && location.longitude === 0;

  const toggleLocation = useCallback(() => {
    if (isLocationOff) {
      fetchCurrentLocation();
    } else {
      setLocationToZero();
    }
  }, [isLocationOff, fetchCurrentLocation, setLocationToZero]);

  return { location, isLocationOff, toggleLocation };
}
