import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../components/ThemeProvider";
import { formatToLocalDateString } from "../../components/time";
import ApiService from "../../utils/api_calls";
import { mapDarkStyle, mapStandardStyle } from "./mapData";
import NoteDetailModal from "./NoteDetailModal";

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
  const _map = useRef(null);
  const _scrollView = useRef(null);

  const toggleMapTypeOptions = () => {
    setShowMapTypeOptions((prevState) => !prevState);
  };

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

      // Ensure all tags are processed safely
      const sanitizedResults = searchResults.map((result) => ({
        ...result,
        tags: (result.tags || []).map((tag) =>
          typeof tag === "string" ? tag.toLowerCase() : "" // Convert valid strings to lowercase, ignore others
        ),
      }));

      setSearchResults(sanitizedResults);
    }
  } catch (error) {
    console.error("Error searching messages:", error);
  }
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

      // console.log("STEP 3: fetchedNotes from ApiService.fetchMessages:", fetchedNotes);

      // Write the count to the log file
      // await RNFS.appendFile(logFilePath, Count of fetched notes: ${fetchedNotes.length}\n, 'utf8')
      //   .then(() => {
      //     console.log('Logged count to file');
      //   })
      //   .catch(err => {
      //     console.error('Error writing to log file:', err);
      //   });


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
  }, [state, globeIcon, searchResults]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchBox: {
      position: "absolute",
      marginTop: Constants.statusBarHeight,
      flexDirection: "row",
      backgroundColor: theme.primaryColor,
      width: "90%",
      alignSelf: "center",
      borderRadius: 5,
      padding: 10,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.125,
      shadowRadius: 5,
      elevation: 10,
    },
    chipsScrollView: {
      position: "absolute",
      top: Platform.OS === "ios" ? 90 : 80,
      paddingHorizontal: 10,
    },
    chipsIcon: {
      marginRight: 5,
    },
    chipsItem: {
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 8,
      paddingHorizontal: 20,
      marginHorizontal: 10,
      height: 35,
      shadowColor: "#ccc",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 10,
    },
    scrollView: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 10,
    },
    endPadding: {
      paddingRight: width - CARD_WIDTH,
    },
    card: {
      // padding: 10,
      elevation: 2,
      backgroundColor: theme.primaryColor,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      marginHorizontal: 10,
      shadowColor: theme.text,
      shadowRadius: 10,
      shadowOpacity: 0.3,
      shadowOffset: { x: 0, y: 0 },
      height: CARD_HEIGHT,
      width: CARD_WIDTH,
      overflow: "hidden",
    },
    cardImage: {
      flex: 3,
      width: "100%",
      height: "100%",
      alignSelf: "center",
    },
    textContent: {
      flex: 2,
      padding: 10,
    },
    cardtitle: {
      fontSize: 12,
      // marginTop: 5,
      fontWeight: "bold",
      color: theme.text,
    },
    cardDescription: {
      fontSize: 12,
      color: theme.primaryColor,
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
    button: {
      alignItems: "center",
      marginTop: 5,
    },
    signIn: {
      width: "100%",
      padding: 5,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 3,
    },
    textSign: {
      fontSize: 14,
      fontWeight: "bold",
    },
    mapTypeSelector: {
      position: "absolute",
      top: Constants.statusBarHeight + 50,
      right: 10,
      alignItems: "center",
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
      // Add any additional styling you need
    },
    mapType: {
      marginHorizontal: 10,
      padding: 10,
      // ... other styling
    },
    selectedMapType: {
      fontWeight: "bold",
      // ... other styling to indicate selection
    },
    mapTypeText: {
      marginHorizontal: 10,
      padding: 10,
      fontSize: 14,
      fontWeight: "bold",
    },
    selectedMapTypeText: {
      fontWeight: "bold",
      color: "blue", // You can adjust the color to highlight the selected option
    },
    clusterMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 125, 0, 0.8)",
    },
    clusterText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    }
  });

  const [state, setState] = useState({
    markers: [],
    categories: [
      {
        name: "Events",
        icon: (
          <MaterialCommunityIcons
            style={styles.chipsIcon}
            name="calendar-multiple"
            size={18}
          />
        ),
      },
      {
        name: "Cultural",
        icon: (
          <Ionicons name="globe-outline" style={styles.chipsIcon} size={18} />
        ),
      },
      {
        name: "History",
        icon: <Ionicons name="md-time" style={styles.chipsIcon} size={18} />,
      },
      {
        name: "Modern",
        icon: (
          <MaterialCommunityIcons
            name="city-variant-outline"
            style={styles.chipsIcon}
            size={18}
          />
        ),
      },
      {
        name: "Religious",
        icon: (
          <MaterialCommunityIcons
            name="church"
            style={styles.chipsIcon}
            size={15}
          />
        ),
      },
    ],
    region: {
      latitude: 38.631393,
      longitude: -90.192226,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
  });

  let mapIndex = 0;
  let mapAnimation = new Animated.Value(0);

  useEffect(() => {
    mapAnimation.addListener(({ value }) => {
      if (!scrollEnabled.current) return;

      const index = Math.floor(value / CARD_WIDTH + 0.3);
      if (index >= state.markers.length) {
        return;
      }

      clearTimeout(regionTimeout);

      const regionTimeout = setTimeout(() => {
        if (mapIndex !== index) {
          mapIndex = index;
          const { coordinate } = state.markers[index];
          _map.current.animateToRegion(
            {
              ...coordinate,
              latitudeDelta: state.region.latitudeDelta,
              longitudeDelta: state.region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. This is required on this page",
          [
            {
              text: "Try Again",
              onPress: () => {
                (async () => {
                  await Location.requestForegroundPermissionsAsync();
                })();
              },
            },
          ]
        );
        return; // Early return to avoid executing further code without permission
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      if (isMounted) {
        setState((prevState) => ({
          ...prevState,
          region: {
            latitude,
            longitude,
            latitudeDelta: 0.04864195044303443,
            longitudeDelta: 0.040142817690068,
          },
        }));
      }
    })();

    return () => (isMounted = false);
  }, []);

  const interpolations = state.markers.map((marker, index) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = mapAnimation.interpolate({
      inputRange,
      outputRange: [1, 1.5, 1],
      extrapolate: "clamp",
    });

    return { scale };
  });

  const onMarkerPress = (e, index) => {
    const pressedMarker = state.markers[index];
    const pressedCoordinate = pressedMarker.coordinate;
    // defining a threshold distance
    const thresholdDistance = 200;
    // haversine formula to caclulate distance between two coordinates
    const haversineDistance = (coords1, coords2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const lat1 = coords1.latitude;
      const lon1 = coords1.longitude;
      const lat2 = coords2.latitude;
      const lon2 = coords2.longitude;
      const R = 6371000; // Earth radius in meters
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d; // distance in meters
    };


    // check for nearby markers
    const nearbyMarkers = state.markers.filter((marker, idx) => {
      if (idx === index) return false; // Skip the pressed marker
      const distance = haversineDistance(pressedCoordinate, marker.coordinate);
      return distance < thresholdDistance;
    });

    if (nearbyMarkers.length > 0) {
      // Zoom into the area containing nearby markers
      const coordinates = [pressedCoordinate, ...nearbyMarkers.map(m => m.coordinate)];
      _map.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else {
      // No nearby markers, proceed to select the marker
      let x = index * CARD_WIDTH + index * 20;
      if (Platform.OS === "ios") {
        x = x - SPACING_FOR_CARD_INSET;
      }
      _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
    }
  };



  const validateRegionBounds = (region) => {
    const minLat = -85; // Southern Hemisphere max bound
    const maxLat = 85;  // Northern Hemisphere max bound
    const minLng = -180;
    const maxLng = 180;

    return {
        ...region,
        latitude: Math.max(minLat, Math.min(maxLat, region.latitude)),
        longitude: Math.max(minLng, Math.min(maxLng, region.longitude)),
    };
  };




  return (
    <View style={styles.container}>
        <MapView
        ref={_map}
        initialRegion={state.region}
        style={styles.container}
        customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
        mapType={mapType}
        data={state.markers}
        >
        {state.markers.map((marker, index) => {
          const scaleStyle = {
            transform: [
              {
            scale: interpolations[index].scale,
              },
            ],
          };
      return (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          onPress={() => onMarkerPress(e, index)}
        >
        <Animated.View style={[styles.markerWrap]}>
          <Animated.Image
            source={require("../../../assets/marker.png")}
            style={[styles.marker, scaleStyle]}
            resizeMode="cover"
          />
          </Animated.View>
        </Marker>
      );
    })}
    </MapView>
      <View style={styles.mapTypeSelector}>
        <TouchableOpacity onPress={toggleMapTypeOptions}>
          <Ionicons name="options-outline" size={25} />
        </TouchableOpacity>
        {showMapTypeOptions && (
          <>
            <TouchableOpacity onPress={() => setMapType("standard")}>
              <Text
                style={
                  mapType === "standard"
                    ? styles.selectedMapTypeText
                    : styles.mapTypeText
                }
              >
                2D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMapType("satellite")}>
              <Ionicons
                name="globe"
                size={25}
                style={
                  mapType === "satellite"
                    ? styles.selectedMapTypeText
                    : styles.mapTypeText
                }
              />
            </TouchableOpacity>
          </>
        )}
      </View>
      <View style={styles.searchBox}>
        <TouchableOpacity
          onPress={() => {
            setGlobeIcon((prevIcon) =>
              prevIcon === "earth-outline" ? "earth" : "earth-outline"
            );
            setSearchResults(null);
          }}
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
            <View style={styles.card} key={index}>
              {marker.images[0] && (
                <Image
                  source={marker.images[0]}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.textContent}>
                <Text
                  numberOfLines={1}
                  style={styles.cardtitle}
                  color={theme.text}
                >
                  {marker.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={styles.cardDescription}
                  color={theme.text}
                >
                  {marker.description
                    .replace(/<[^>]+>/g, "")
                    .substring(0, 200)
                    .trim()}
                </Text>
                <View style={styles.button}>
                  <TouchableOpacity
                    onPress={() => onViewNote(marker)}
                    style={[
                      styles.signIn,
                      {
                        borderColor: theme.text,
                        borderWidth: 1,
                        borderRadius: 15,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textSign,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      View Note
                    </Text>
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