import React, { useEffect, useEffectEvent, useState, useRef, useCallback, useMemo } from "react";
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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
  const { colors, isDarkmode, accentColor } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteDetailData | undefined>(undefined);
  const [globeIcon, setGlobeIcon] = useState<"earth-outline" | "earth">("earth-outline");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [mapType] = useState<"standard" | "satellite" | "hybrid" | "terrain">("standard");

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 38.631393,
    longitude: -90.192226,
    latitudeDelta: 0.04864195044303443,
    longitudeDelta: 0.040142817690068,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const _map = useRef<MapView | null>(null);
  const _scrollView = useRef<ScrollView | null>(null);
  const mapAnimation = useRef(new Animated.Value(0)).current;
  const scrollEnabled = useRef(true);

  const mapNoteToMarker = useCallback((note: Note): MapMarker => {
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
  }, []);

  const sortNotesByProximity = useCallback(
    (markers: MapMarker[]): MapMarker[] => {
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
    },
    [userLocation]
  );

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
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  const {
    data: paginatedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["explore", "notes"],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchNotes({ published: true, limit: LIMIT, offset: pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined;
      return allPages.reduce((total, page) => total + page.length, 0);
    },
  });

  const { data: searchData } = useQuery({
    queryKey: ["explore", "search", activeSearch],
    queryFn: () => fetchNotes({ search: activeSearch!, published: true, limit: 50 }),
    enabled: !!activeSearch,
  });

  useEffect(() => {
    if (searchData && searchData.length > 0) {
      const firstResult = searchData[0];
      setRegion((prev) => ({
        ...prev,
        latitude: Number(firstResult.latitude) || 0,
        longitude: Number(firstResult.longitude) || 0,
      }));
    }
  }, [searchData]);

  const markers = useMemo(() => {
    const notes = activeSearch && searchData ? searchData : (paginatedData?.pages.flat() ?? []);
    const mapped = notes.map(mapNoteToMarker);
    return sortNotesByProximity(mapped);
  }, [activeSearch, searchData, paginatedData, mapNoteToMarker, sortNotesByProximity]);

  const handleSearch = () => {
    Keyboard.dismiss();
    setActiveSearch(searchQuery || null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onViewNote = (note: MapMarker) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const onMapScroll = useEffectEvent(({ value }: { value: number }) => {
    const calculatedIndex = Math.floor(value / (CARD_WIDTH + 20) + 0.3);
    const index = calculatedIndex >= markers.length ? markers.length - 1 : calculatedIndex;
    setCurrentIndex(index);
    if (!scrollEnabled.current) return;
    if (index < 0 || index >= markers.length) return;
    const { coordinate } = markers[index];
    _map.current?.animateToRegion(
      {
        ...coordinate,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
      350
    );
  });

  useEffect(() => {
    const listenerId = mapAnimation.addListener(onMapScroll);
    return () => mapAnimation.removeListener(listenerId);
  }, [mapAnimation]);

  const onMarkerPress = (markerData: MapMarker) => {
    scrollEnabled.current = false;

    const markerIndex = markers.findIndex(
      (marker) =>
        marker.coordinate.latitude === markerData.coordinate.latitude && marker.coordinate.longitude === markerData.coordinate.longitude
    );

    if (markerIndex !== -1) {
      const offset = markerIndex * (CARD_WIDTH + 20);
      _scrollView.current?.scrollTo({ x: offset, y: 0, animated: true });

      _map.current?.animateToRegion(
        {
          ...markerData.coordinate,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        },
        350
      );

      setTimeout(() => {
        scrollEnabled.current = true;
      }, 1000);
    }
  };

  const totalFetched = paginatedData?.pages.flat().length ?? 0;
  const shouldShowLoadMore = !activeSearch && !!hasNextPage && currentIndex >= totalFetched - 1;

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
        initialRegion={region}
        style={{ flex: 1 }}
        customMapStyle={isDarkmode ? mapDarkStyle : mapStandardStyle}
        mapType={mapType}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate} onPress={() => onMarkerPress(marker)}>
            <Animated.View style={{ alignItems: "center", justifyContent: "center", width: 50, height: 50 }}>
              <Animated.Image source={require("../../../assets/marker.png")} style={{ width: 30, height: 30 }} resizeMode="cover" />
            </Animated.View>
          </Marker>
        ))}
      </MapView>

      <View
        className="elevation-[10] absolute w-[90%] flex-row self-center rounded-[5px] p-2.5 shadow-md"
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
          <Ionicons name={globeIcon} size={25} color={globeIcon === "earth" ? "green" : colors.foreground} style={{ marginRight: 9 }} />
        </TouchableOpacity>
        <TextInput
          returnKeyType="done"
          placeholder="Search here"
          placeholderTextColor={colors.foreground}
          autoCapitalize="none"
          style={{ flex: 1, padding: 0, color: colors.foreground }}
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
          <Ionicons name="search" size={25} onPress={handleSearch} color={colors.foreground} />
        </Tooltip>
      </View>
      <View style={{ position: "absolute", bottom: 90, left: 0, right: 0 }}>
        <Tooltip
          isVisible={scrollTip}
          showChildInTooltip={false}
          topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
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
            style={{ paddingVertical: 10 }}
            contentInset={{ top: 0, left: SPACING_FOR_CARD_INSET, bottom: 0, right: SPACING_FOR_CARD_INSET }}
            contentContainerStyle={{ paddingHorizontal: Platform.OS === "android" ? SPACING_FOR_CARD_INSET : 0 }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: mapAnimation } } }], {
              useNativeDriver: true,
            })}
          >
            {markers.map((marker, index) => (
              <MapNotesComponent key={index} index={index} marker={marker} onViewNote={onViewNote} />
            ))}

            {shouldShowLoadMore && (
              <View
                testID="loadMoreButton"
                className="items-center justify-center"
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
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={colors.foreground} />
                ) : (
                  <TouchableOpacity
                    testID="loadMoreTouchable"
                    onPress={handleLoadMore}
                    className="h-[50%] w-[70%] items-center justify-center rounded-[3px]"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text className="text-[32px]" style={{ color: colors.foreground }}>
                      Load More
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.ScrollView>
        </Tooltip>
      </View>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </View>
  );
};

export default ExploreScreen;
