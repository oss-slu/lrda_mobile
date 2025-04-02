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
  StatusBar,
  ActivityIndicator
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
import { MapNotesComponent } from "../../components/MapNotesComponent";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;
const LIMIT = 20; // Number of notes per batch

const ExploreScreen = () => {
  const { theme, isDarkmode } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [globeIcon, setGlobeIcon] = useState("earth-outline");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState("standard");
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

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const _map = useRef(null);
  const _scrollView = useRef(null);
  const mapAnimation = useRef(new Animated.Value(0)).current; // Flag to control interactions between scrolling and marker pressing
  const scrollEnabled = useRef(true);

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
    try {
      const results = await ApiService.searchMessages(searchQuery);
      if (results && results.length > 0) {
        const firstResult = results[0];
        const newRegion = {
          ...state.region,
          latitude: parseFloat(firstResult.latitude) || 0,
          longitude: parseFloat(firstResult.longitude) || 0,
        };
        setState((prevState) => ({ ...prevState, region: newRegion }));
        const sanitizedResults = results.map((result) => ({
          ...result,
          tags: (result.tags || []).map((tag) =>
            typeof tag === "string" ? tag.toLowerCase() : ""
          ),
        }));
        setSearchResults(sanitizedResults);
      }
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  }, [searchQuery, state.region]);


  const mapNoteToMarker = (note) => {
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
  };


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
    const listenerId = mapAnimation.addListener(({ value }) => {
      if (!scrollEnabled.current) return;
  
      // Calculate index based on scroll position
      const index = Math.floor(value / (CARD_WIDTH + 20));
      if (index >= state.markers.length || index < 0) {
        return;
      }
  
      const marker = state.markers[index];
      if (marker) {
        // Animate the map to the marker's region
        _map.current.animateToRegion(
          {
            ...marker.coordinate,
            latitudeDelta: state.region.latitudeDelta,
            longitudeDelta: state.region.longitudeDelta,
          },
          350
        );
      }
    });
  
    return () => {
      mapAnimation.removeListener(listenerId); // Cleanup listener on unmount
    };
  }, [state.markers]);
  
  
  
  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  const fetchMessages = useCallback(
    async (pageNum = 1) => {
      try {
        if (searchResults) {
          const fetchedMarkers = searchResults.map(mapNoteToMarker);
          const sortedMarkers = sortNotesByProximity(fetchedMarkers);
          setState((prevState) => ({ ...prevState, markers: sortedMarkers }));
        } else {
          const skip = (pageNum - 1) * LIMIT;
          const fetchedNotes = await ApiService.fetchMessagesBatch(
            globeIcon === "earth",
            globeIcon !== "earth",
            "someUserId",
            LIMIT,
            skip
          );
          const fetchedMarkers = fetchedNotes.map(mapNoteToMarker);
          const sortedMarkers = sortNotesByProximity(fetchedMarkers);
          if (pageNum === 1) {
            setState((prevState) => ({ ...prevState, markers: sortedMarkers }));
          } else {
            setState((prevState) => ({
              ...prevState,
              markers: [...prevState.markers, ...sortedMarkers],
            }));
          }
          setHasMore(fetchedNotes.length === LIMIT);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    },
    [globeIcon, searchResults, userLocation]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [userLocation, globeIcon, searchResults]);

  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await fetchMessages(nextPage);
      setPage(nextPage);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const listenerId = mapAnimation.addListener(({ value }) => {
      // Calculate index and cap it at the last marker index
      const calculatedIndex = Math.floor(value / (CARD_WIDTH + 20) + 0.3);
      const index = calculatedIndex >= state.markers.length ? state.markers.length - 1 : calculatedIndex;
      setCurrentIndex(index);
      if (!scrollEnabled.current) return;
      if (index < 0 || index >= state.markers.length) return;
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
    return () => mapAnimation.removeListener(listenerId);
  }, [state.markers]);

  const onMarkerPress = (markerData) => {

    scrollEnabled.current = false;

    const markerIndex = state.markers.findIndex(
      (marker) =>
        marker.coordinate.latitude === markerData.coordinate.latitude &&
        marker.coordinate.longitude === markerData.coordinate.longitude
    );

    if (markerIndex !== -1) {
      // Scroll to the card corresponding to the marker
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
  

  const shouldShowLoadMore = !searchResults && hasMore && currentIndex >= page * LIMIT - 1;

  return (
    <View style={styles.container} testID="Explore">
      <StatusBar translucent backgroundColor="transparent" />
      <MapView
      provider="google"
        ref={_map}
        initialRegion={state.region}
        style={styles.container}
        customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
        mapType={mapType}
      >

        {state.markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate} onPress={() => onMarkerPress(marker)}>
            <Animated.View style={styles.markerWrap}>
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
        <TouchableOpacity
          onPress={() =>
            setGlobeIcon((prev) => (prev === "earth-outline" ? "earth" : "earth-outline"))
          }
        >
          <Ionicons
            name={globeIcon}
            size={25}
            color={globeIcon === "earth" ? "green" : theme.text}
            style={{ marginRight: 9 }}
          />
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
        testID="cardScrollView"
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        snapToAlignment="center"
        style={styles.scrollView}
        contentInset={{ top: 0, left: SPACING_FOR_CARD_INSET, bottom: 0, right: SPACING_FOR_CARD_INSET }}
        contentContainerStyle={{ paddingHorizontal: Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: mapAnimation } } }], {
          useNativeDriver: true,
        })}
      >
        {state.markers.map((marker, index) => (
          <MapNotesComponent key={index} index={index} marker={marker} onViewNote={onViewNote} />
        ))}

        {shouldShowLoadMore && (
          <View style={styles.loadMoreCard}    testID="loadMoreButton">
            {isLoadingMore ? (
              <ActivityIndicator size="small" color={theme.text} />
            ) : (
              <TouchableOpacity
             
                onPress={handleLoadMore}
                style={[styles.loadMoreButton, { backgroundColor: theme.homeColor }]}
              >
                <Text style={[styles.loadMoreButtonText, { color: theme.text }]}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Animated.ScrollView>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </View>
  );
};

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
    backgroundColor: "#333",
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

  scrollView: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },

  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
  },
  marker: {
    width: 30,
    height: 30,
  },

  loadMoreCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT-55,
    marginRight: 30,
    marginLeft: -30,
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  loadMoreButton: {
    width: "70%",
    height: "50%",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },

  loadMoreButtonText: {
    fontSize: 32,
  },
});

export default ExploreScreen;
