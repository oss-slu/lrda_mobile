import React, { useEffect, useState, useRef, useCallback } from "react";
import {
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
  ActivityIndicator,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import NoteDetailModal, { NoteDetailData } from "./NoteDetailModal";
import { formatToLocalDateString } from "../../components/time";
import { Ionicons } from "@expo/vector-icons";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../../onboarding/TooltipComponent";
import { mapDarkStyle, mapStandardStyle } from "./mapData";
import { fetchNotes } from "../../utils/api_calls";
import Constants from "expo-constants";
import { useTheme } from "../../components/ThemeProvider";
import { MapNotesComponent } from "../../components/MapNotesComponent";
import { getHasDoneTutorial, setTutorialDone } from "../../utils/tutorial";
import { Note, MapMarker } from "../../../types";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 220;
const CARD_WIDTH = width * 0.8;
const SPACING_FOR_CARD_INSET = width * 0.1 - 10;
const LIMIT = 20;

const ExploreScreen = () => {
  const { theme, isDarkmode } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteDetailData | undefined>(undefined);
  const [globeIcon, setGlobeIcon] = useState<"earth-outline" | "earth">("earth-outline");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid" | "terrain">("standard");
  const [showMapTypeOptions, setShowMapTypeOptions] = useState(false);
  const [searchResults, setSearchResults] = useState<Note[] | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [state, setState] = useState<{
    markers: MapMarker[];
    region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  }>({
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

  const _map = useRef<MapView | null>(null);
  const _scrollView = useRef<ScrollView | null>(null);
  const mapAnimation = useRef(new Animated.Value(0)).current;
  const scrollEnabled = useRef(true);

  const toggleMapTypeOptions = () => setShowMapTypeOptions(!showMapTypeOptions);

  const onViewNote = (note: MapMarker) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    searchForMessages();
  };

  const searchForMessages = useCallback(async () => {
    try {
      const results = await fetchNotes({ search: searchQuery, published: true, limit: 50 });
      if (results && results.length > 0) {
        const firstResult = results[0];
        const newRegion = {
          ...state.region,
          latitude: Number(firstResult.latitude) || 0,
          longitude: Number(firstResult.longitude) || 0,
        };
        setState((prevState) => ({ ...prevState, region: newRegion }));
        const sanitizedResults = results.map((result) => ({
          ...result,
          tags: (result.tags || []).map((tag) => (typeof tag === "string" ? tag.toLowerCase() : "")),
        }));
        setSearchResults(sanitizedResults);
      }
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  }, [searchQuery, state.region]);

  const mapNoteToMarker = (note: Note): MapMarker => {
    const time = new Date(note.time);
    const latitude = note.latitude ?? 0;
    const longitude = note.longitude ?? 0;
    return {
      coordinate: {
        latitude: isNaN(latitude) ? 0 : latitude,
        longitude: isNaN(longitude) ? 0 : longitude,
      },
      creatorId: note.creatorId || "",
      title: note.title || "Untitled",
      description: note.text || "No description available",
      images:
        note.media?.length > 0
          ? note.media.map((mediaItem: { uri: string }) => ({ uri: mediaItem.uri.toString() }))
          : [{ uri: Image.resolveAssetSource(require("../../../assets/map_marker.png")).uri }],
      time: formatToLocalDateString(time),
      tags: note.tags || [],
    };
  };

  const sortNotesByProximity = (markers: MapMarker[]): MapMarker[] => {
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  useEffect(() => {
    const listenerId = mapAnimation.addListener(({ value }) => {
      if (!scrollEnabled.current) return;

      const index = Math.floor(value / (CARD_WIDTH + 20));
      if (index >= state.markers.length || index < 0) {
        return;
      }

      const marker = state.markers[index];
      if (marker) {
        _map.current?.animateToRegion(
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
      mapAnimation.removeListener(listenerId);
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
          const fetchedNotes = await fetchNotes({ published: true, limit: LIMIT, offset: skip });
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
      const calculatedIndex = Math.floor(value / (CARD_WIDTH + 20) + 0.3);
      const index = calculatedIndex >= state.markers.length ? state.markers.length - 1 : calculatedIndex;
      setCurrentIndex(index);
      if (!scrollEnabled.current) return;
      if (index < 0 || index >= state.markers.length) return;
      const { coordinate } = state.markers[index];
      _map.current?.animateToRegion(
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

  const onMarkerPress = (markerData: MapMarker) => {
    scrollEnabled.current = false;

    const markerIndex = state.markers.findIndex(
      (marker) =>
        marker.coordinate.latitude === markerData.coordinate.latitude && marker.coordinate.longitude === markerData.coordinate.longitude
    );

    if (markerIndex !== -1) {
      const offset = markerIndex * (CARD_WIDTH + 20);
      _scrollView.current?.scrollTo({ x: offset, y: 0, animated: true });

      _map.current?.animateToRegion(
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

  const [userTutorial, setUserTutorial] = useState(false);

  const [searchToolTip, setSearchToolTip] = useState(true);
  const [scrollTip, setScrollTip] = useState(false);

  useEffect(() => {
    getHasDoneTutorial("Explore").then((result) => {
      console.log("USER TUTORIAL: " + result);
      setUserTutorial(result);
    });
  }, []);

  return (
    <View className="flex-1" testID="Explore">
      <StatusBar translucent backgroundColor="transparent" />
      <MapView
        ref={_map}
        initialRegion={state.region}
        className="flex-1"
        customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
        mapType={mapType}
      >
        {state.markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate} onPress={() => onMarkerPress(marker)}>
            <Animated.View style={{ alignItems: "center", justifyContent: "center", width: 50, height: 50 }}>
              <Animated.Image source={require("../../../assets/marker.png")} style={{ width: 30, height: 30 }} resizeMode="cover" />
            </Animated.View>
          </Marker>
        ))}
      </MapView>

      <View
        className="absolute flex-row w-[90%] self-center rounded-[5px] p-2.5 shadow-md elevation-[10]"
        style={{
          marginTop: Constants.statusBarHeight,
          backgroundColor: isDarkmode ? "#333" : "#fff",
          shadowColor: "#ccc",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
        }}
      >
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
        <Tooltip
          topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
          isVisible={searchToolTip && !userTutorial}
          content={
            <TooltipContent
              message="Try out our search bar!"
              onPressOk={() => {
                console.log("Okay pressed");
                setSearchToolTip(false);
                setScrollTip(true);
              }}
              onSkip={() => {
                setSearchToolTip(false);
                setScrollTip(false);
                setTutorialDone("Explore", true);
              }}
            />
          }
          placement="bottom"
        >
          <Ionicons name="search" size={25} onPress={handleSearch} color={theme.text} />
        </Tooltip>
      </View>
      <Tooltip
        isVisible={scrollTip}
        showChildInTooltip={false}
        topAdjustment={Platform.OS === "android" ? -250 : -250}
        content={
          <TooltipContent
            message="Scroll left to view published notes all around the world!"
            onPressOk={() => {
              setScrollTip(false);
              setTutorialDone("Explore", true);
            }}
            onSkip={() => {
              setSearchToolTip(false);
              setScrollTip(false);
              setTutorialDone("Explore", true);
            }}
          />
        }
        placement="top"
      >
        <Animated.ScrollView
          ref={_scrollView}
          testID="cardScrollView"
          horizontal
          pagingEnabled
          scrollEventThrottle={1}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          snapToAlignment="center"
          style={{ position: "absolute", bottom: 90, left: 0, right: 0, paddingVertical: 10 }}
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
            <View
              testID="loadMoreButton"
              className="justify-center items-center"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT - 55,
                marginRight: 30,
                marginLeft: -30,
                borderRadius: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 0,
              }}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <TouchableOpacity
                  testID="loadMoreTouchable"
                  onPress={handleLoadMore}
                  className="w-[70%] h-[50%] rounded-[3px] justify-center items-center"
                  style={{ backgroundColor: theme.homeColor }}
                >
                  <Text className="text-[32px]" style={{ color: theme.text }}>Load More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </Tooltip>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </View>
  );
};

export default ExploreScreen;
