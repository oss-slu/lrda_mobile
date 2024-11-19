import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import NoteDetailModal from "./NoteDetailModal";
import { formatToLocalDateString } from "../../components/time";
import Ionicons from "react-native-vector-icons/Ionicons";

import { mapDarkStyle, mapStandardStyle } from "./mapData";
import ApiService from "../../utils/api_calls";
import Constants from "expo-constants";
import { useTheme } from "../../components/ThemeProvider";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;

const ExploreScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [globeIcon, setGlobeIcon] = useState("earth-outline");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState("standard");
  const { theme, isDarkmode } = useTheme(); // Access theme and dark mode
  const [showMapTypeOptions, setShowMapTypeOptions] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // Store user's current location
  const [state, setState] = useState({
    markers: [],
    region: {
      latitude: 38.631393,
      longitude: -90.192226,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  });

  const _map = useRef(null);
  const _scrollView = useRef(null);
  const mapAnimation = useRef(new Animated.Value(0)).current; // Track scroll position

  const scrollEnabled = useRef(true); // Flag to control interactions between scrolling and marker pressing

  const toggleMapTypeOptions = () => setShowMapTypeOptions(!showMapTypeOptions);

  const onViewNote = (note) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    searchForMessages();
  };

  const searchForMessages = useCallback(async () => {
    const searchResults = await ApiService.searchMessages(searchQuery);
    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      const newRegion = {
        ...state.region,
        latitude: parseFloat(firstResult.latitude) || 0,
        longitude: parseFloat(firstResult.longitude) || 0,
      };
      setState((prevState) => ({
        ...prevState,
        region: newRegion,
      }));
    }
    setSearchResults(searchResults);
  }, [searchQuery, state.region]);

  const fetchMessages = useCallback(async () => {
    try {
      const fetchedNotes = searchResults
        ? searchResults
        : await ApiService.fetchMessages(
            globeIcon === "earth",
            globeIcon !== "earth",
            "someUserId"
          );

      const fetchedMarkers = fetchedNotes.map((note) => {
        const time = note.time ? new Date(note.time) : new Date(note.__rerum.createdAt);
        const offsetInHours = new Date().getTimezoneOffset() / 60;
        time.setHours(time.getHours() - offsetInHours);

        const latitude = parseFloat(note.latitude);
        const longitude = parseFloat(note.longitude);

        return {
          coordinate: {
            latitude: isNaN(latitude) ? 0 : latitude,
            longitude: isNaN(longitude) ? 0 : longitude,
          },
          creator: note.creator || "",
          createdAt: note.__rerum.createdAt || "",
          title: note.title || "Untitled",
          description: note.BodyText || "No description available",
          images:
            note.media?.length > 0
              ? note.media.map((mediaItem) => ({ uri: mediaItem.uri.toString() }))
              : [{ uri: Image.resolveAssetSource(require("../../../assets/map_marker.png")).uri }],
          time: formatToLocalDateString(time),
          tags: note.tags || [],
        };
      });

      const sortedMarkers = sortNotesByProximity(fetchedMarkers);
      setState((prevState) => ({
        ...prevState,
        markers: sortedMarkers,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [globeIcon, searchResults, userLocation]);

  const sortNotesByProximity = (markers) => {
    if (!userLocation) return markers;
    return markers
      .map((marker) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marker.coordinate.latitude,
          marker.coordinate.longitude
        );
        return { ...marker, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [userLocation, globeIcon, searchResults]);

  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      if (!scrollEnabled.current) return;

      const index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= state.markers.length) {
        return;
      }

      const { coordinate } = state.markers[index];
      _map.current.animateToRegion(
        {
          ...coordinate,
          latitudeDelta: state.region.latitudeDelta,
          longitudeDelta: state.region.longitudeDelta,
        },
        350
      );
    });
  }, [state.markers]);

  const onMarkerPress = (markerData) => {
    scrollEnabled.current = false;

    const markerIndex = state.markers.findIndex(
      (marker) =>
        marker.coordinate.latitude === markerData.coordinate.latitude &&
        marker.coordinate.longitude === markerData.coordinate.longitude
    );

    if (markerIndex !== -1) {
      const offset = markerIndex * (CARD_WIDTH + 20);
      _scrollView.current.scrollTo({ x: offset, y: 0, animated: true });

      _map.current.animateToRegion(
        {
          ...markerData.coordinate,
          latitudeDelta: state.region.latitudeDelta,
          longitudeDelta: state.region.longitudeDelta,
        },
        350
      );

      setTimeout(() => {
        scrollEnabled.current = true;
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
     <MapView
  ref={_map}
  initialRegion={state.region}
  style={styles.container}
  customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
  mapType={mapType}
>

        {state.markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            onPress={() => onMarkerPress(marker)}
          >
            <Animated.View style={[styles.markerWrap]}>
              <Animated.Image
                source={require("../../../assets/marker.png")}
                style={styles.marker}
                resizeMode="cover"
              />
            </Animated.View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.searchBox, isDarkmode && styles.searchBoxDark]}>
        <TouchableOpacity onPress={() => setGlobeIcon((prev) => (prev === "earth-outline" ? "earth" : "earth-outline"))}>
          <Ionicons name={globeIcon} size={25} color={globeIcon === "earth" ? "green" : theme.text} style={{ marginRight: 9 }} />
        </TouchableOpacity>
        <TextInput
          returnKeyType="done"
          placeholder="Search here"
          placeholderTextColor={theme.text}
          autoCapitalize="none"
          style={{ flex: 1, padding: 0, color: theme.text }}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <Ionicons name="search" size={25} onPress={handleSearch} color={theme.text} />
      </View>

      <Animated.ScrollView
        ref={_scrollView}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        style={styles.scrollView}
        contentInset={{ top: 0, left: SPACING_FOR_CARD_INSET, bottom: 0, right: SPACING_FOR_CARD_INSET }}
        contentContainerStyle={{ paddingHorizontal: Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: mapAnimation } } }],
          { useNativeDriver: true }
        )}
      >
        {state.markers.map((marker, index) => (
          <View
            style={[
              styles.card,
              isDarkmode && styles.cardDark,
            ]}
            key={index}
          >
            {marker.images[0] && <Image source={marker.images[0]} style={styles.cardImage} resizeMode="cover" />}
            <View style={styles.textContent}>
              <Text numberOfLines={1} style={[styles.cardtitle, { color: theme.text }]}>
                {marker.title || "Untitled"}
              </Text>
              <Text numberOfLines={1} style={[styles.cardDescription, { color: theme.text }]}>
                {(typeof marker.description === "string" ? marker.description : "No description available").replace(/<[^>]+>/g, "").substring(0, 200).trim()}
              </Text>

              <View style={styles.button}>
                <TouchableOpacity onPress={() => onViewNote(marker)} style={[styles.signIn, { borderColor: theme.text, borderWidth: 1, borderRadius: 15 }]}>
                  <Text style={[styles.textSign, { color: theme.text }]}>View Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    position: "absolute",
    marginTop: Constants.statusBarHeight,
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "90%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  searchBoxDark: {
    backgroundColor: "#333", // Dark mode background color
  },
  mapTypeSelector: {
    position: "absolute",
    top: Constants.statusBarHeight + 50,
    right: 10,
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  mapTypeText: { fontSize: 14, fontWeight: "bold" },
  selectedMapTypeText: { fontWeight: "bold", color: "blue" },
  scrollView: { position: "absolute", bottom: 0, left: 0, right: 0, paddingVertical: 10 },
  card: {
    elevation: 2,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  cardDark: {
    backgroundColor: "#222", // Dark mode card background
  },
  cardImage: { flex: 3, width: "100%", height: "100%", alignSelf: "center" },
  textContent: { flex: 2, padding: 10 },
  cardtitle: { fontSize: 12, fontWeight: "bold" },
  cardDescription: { fontSize: 12 },
  markerWrap: { alignItems: "center", justifyContent: "center", width: 50, height: 50 },
  marker: { width: 30, height: 30 },
  button: { alignItems: "center", marginTop: 5 },
  signIn: { width: "100%", padding: 5, justifyContent: "center", alignItems: "center", borderRadius: 3 },
  textSign: { fontSize: 14, fontWeight: "bold" },
});

export default ExploreScreen;
