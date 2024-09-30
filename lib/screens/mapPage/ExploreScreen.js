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
import MapView, { Marker } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../components/ThemeProvider";
import { formatToLocalDateString } from "../../components/time";
import ApiService from "../../utils/api_calls";
import NoteDetailModal from "./NoteDetailModal";
import { mapDarkStyle, mapStandardStyle } from "./mapData";

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
  const { theme, isDarkmode } = useTheme();
  const [showMapTypeOptions, setShowMapTypeOptions] = useState(false);

  // Add the rest of your component logic here


  const toggleMapTypeOptions = () => {
    setShowMapTypeOptions((prevState) => !prevState);
  };

  const onViewNote = (note) => {
    console.log(note);
    setSelectedNote(note);
    setModalVisible(true);
  };
  const handleSearch = () => {
    Keyboard.dismiss();
    searchForMessages();
  };

  const [searchResults, setSearchResults] = useState(null);

  console.log("STEP 1: Checking state:", state);

  const searchForMessages = useCallback(async () => {
    console.log("Searching for messages: ", searchQuery);
    const searchResults = await ApiService.searchMessages(searchQuery);
    console.log(
      "STEP 2: searchResults from ApiService.searchMessages:",
      searchResults
    );

    if (searchResults && searchResults.length > 0) {
      const firstResult = searchResults[0];
      const latitude = parseFloat(firstResult.latitude) || 0;
      const longitude = parseFloat(firstResult.longitude) || 0;
      2;
      const newRegion = {
        ...state.region,
        latitude,
        longitude,
      };
      setState((prevState) => ({
        ...prevState,
        region: newRegion,
      }));

      // _map.current.animateToRegion(newRegion, 350);
    }
    setSearchResults(searchResults);
  });

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
      // await RNFS.appendFile(logFilePath, `Count of fetched notes: ${fetchedNotes.length}\n`, 'utf8')
      //   .then(() => {
      //     console.log('Logged count to file');
      //   })
      //   .catch(err => {
      //     console.error('Error writing to log file:', err);
      //   });


      const fetchedMarkers = fetchedNotes.map((note) => {
        let time;
        if (note.time === undefined) {
          time = new Date(note.__rerum.createdAt);
          var date = new Date();
          var offsetInHours = date.getTimezoneOffset() / 60;
          time.setHours(time.getHours() - offsetInHours);
        } else {
          time = new Date(note.time);
        }
  
        return {
          coordinate: {
            latitude: parseFloat(note.latitude) || 0,
            longitude: parseFloat(note.longitude) || 0,
          },
          creator: note.creator || "",
          createdAt: note.__rerum.createdAt || "",
          title: note.title || "",
          description: note.BodyText || "",
          images: note.media && note.media.length > 0
          ? note.media.map((mediaItem) => ({ uri: mediaItem.uri.toString() }))
          : [{ uri: Image.resolveAssetSource(require("../../../assets/map_marker.png")).uri }],
        
          time: formatToLocalDateString(time) || "",
          tags: note.tags || [],
        };
      });
  
      setState((prevState) => ({
        ...prevState,
        markers: fetchedMarkers,
        notesCount: fetchedNotes.length, // if you need to use this count in your state
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });
  

  useEffect(() => {
    fetchMessages();
  }, [ globeIcon, searchResults]);



  const createStyles = (theme, isDarkmode) => StyleSheet.create({
    container: {
      flex: 1,
    },
    searchBox: {
      position: "absolute",
      marginTop: Constants.statusBarHeight,
      flexDirection: "row",
      backgroundColor:"#ffff",
      width: "90%",
      alignSelf: "center",
      borderRadius: 5,
      padding: 10,
      shadowColor: "#cccc",
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
      color: "black",
    },
    selectedMapTypeText: {
      fontWeight: "bold",
      color: "blue", // You can adjust the color to highlight the selected option
    },
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
      let index = Math.floor(value / CARD_WIDTH + 2); // animate 30% away from landing on the next item
      if (index >= state.markers.length) {
        index = state.markers.length - 1;
      }
      if (index <= 0) {
        index = 0;
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

  const onMarkerPress = (markerID) => {
    let x = markerID * CARD_WIDTH + markerID * 20;
    if (Platform.OS === "ios") {
      x = x - SPACING_FOR_CARD_INSET;
    }
  
    _scrollView.current.scrollTo({ x: x, y: 0, animated: true });
  };

  const _map = useRef(null);
  const _scrollView = useRef(null);

  return (
    <View style={styles.container}>
      <MapView
        ref={_map}
        region={state.region}
        style={styles.container}
        customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
        mapType={mapType}
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
              key={index}
              coordinate={marker.coordinate}
              onPress={() => onMarkerPress(index)}
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
        <Ionicons
          name="search"
          size={25}
          onPress={handleSearch}
          color={theme.text}
        />
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
        contentInset={{
          top: 0,
          left: SPACING_FOR_CARD_INSET,
          bottom: 0,
          right: SPACING_FOR_CARD_INSET,
        }}
        contentContainerStyle={{
          paddingHorizontal:
            Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0,
        }}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: mapAnimation,
                },
              },
            },
          ],
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
      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBox: {
    position: "absolute",
    marginTop: Constants.statusBarHeight,
    flexDirection: "row",
    backgroundColor: "#ffff",
    width: "90%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#cccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
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
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 2,
    padding: 10,
    color: "#cccc",
  },
  cardtitle: {
    fontSize: 12,
    // marginTop: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
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
});


