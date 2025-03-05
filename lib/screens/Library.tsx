import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { Note } from "../../types";
import ApiService from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";
import { SwipeListView } from "react-native-swipe-list-view";
import NoteSkeleton from "../components/noteSkeleton";
import { formatToLocalDateString } from "../components/time";
import { useTheme } from "../components/ThemeProvider";
import Constants from "expo-constants";
import NoteDetailModal from "./mapPage/NoteDetailModal";
import ToastMessage from "react-native-toast-message";
import NotesComponent from "../components/NotesComponent";
import Greeting from "../components/Greeting";
import LottieView from "lottie-react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");
const user = User.getInstance();

const Library: React.FC = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [published, setPublished] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUserName] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme, isDarkmode } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const animation = useRef(new Animated.Value(0)).current;
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);

  // Pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20; // batch size

  let textLength = 18;

  useEffect(() => {
    (async () => {
      const name = await user.getName();
      setUserName(name);
      if (name) {
        const initials = name.split(" ").map((part) => part[0]).join("");
        setUserInitials(initials);
      }
    })();
  }, []);

  const refreshPage = () => {
    setPage(1);
    setHasMore(true);
    setUpdateCounter((prev) => prev + 1);
  };

  useEffect(() => {
    setRendering(true);
    setPage(1);
    setHasMore(true);
    fetchNotes(1);
  }, [updateCounter, published]);

  const fetchNotes = async (pageNumber: number) => {
    try {
      const userId = await user.getId();
      const skip = (pageNumber - 1) * limit;
      const data = await ApiService.fetchMessagesBatch(
        isPrivate,
        published,
        isPrivate ? userId : "",
        limit,
        skip
      );

      const unarchivedNotes = data.filter((note: Note) => !note.isArchived);
      let fetchedNotes = DataConversion.convertMediaTypes(unarchivedNotes)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      if (pageNumber === 1) {
        setNotes(fetchedNotes);
      } else {
        setNotes((prev) => [...prev, ...fetchedNotes]);
      }

      setHasMore(fetchedNotes.length === limit);
      setRendering(false);
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      ToastMessage.show({
        type: "error",
        text1: "Error fetching notes",
        text2: error.message,
      });
      setRendering(false);
    }
  };

  // Load more button logic using page-based approach
  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await fetchNotes(nextPage);
      setPage(nextPage);
      setIsLoadingMore(false);
    }
  };

  const toggleSearchBar = () => {
    if (isSearchVisible) {
      setSearchQuery("");
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      setIsSearchVisible(true);
      Animated.timing(animation, {
        toValue: width - 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const searchBarWidth = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, width],
  });

  const handleSort = () => {
    setIsSortOpened(!isSortOpened);
  };

  const handleSortOption = ({ option }) => {
    setSelectedSortOption(option);
    setIsSortOpened(false);
  };

  const updateNote = (note: Note) => {
    setNotes((prev) =>
      prev.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
    refreshPage();
  };

  const renderItem = (data: any) => {
    const item = data.item;
    const tempTime = new Date(item.time);
    const showTime = formatToLocalDateString(tempTime);
    const mediaItem = item.media[0];
    const ImageType = mediaItem?.getType();
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.getUri();
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.getThumbnail();
      IsImage = true;
    }
    const resolvedImageURI =
      Platform.OS === "android" ? String(ImageURI || "") : ImageURI;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={{
          backgroundColor: isDarkmode ? "black" : "#e6e6e6",
          width: "100%",
        }}
        onPress={() => {
          if (!item.published) {
            navigation.navigate("EditNote", {
              note: item,
              onSave: (editedNote: Note) => {
                updateNote(editedNote);
                refreshPage();
              },
            });
          } else {
            const formattedNote = {
              ...item,
              time: formatToLocalDateString(new Date(item.time)),
              description: item.text,
              images: item.media.map((mediaItem: { uri: any }) => ({
                uri: mediaItem.uri,
              })),
            };
            setSelectedNote(formattedNote);
            setModalVisible(true);
          }
        }}
      >
        <NotesComponent
          IsImage={IsImage}
          resolvedImageURI={resolvedImageURI}
          ImageType={ImageType}
          textLength={textLength}
          showTime={showTime}
          item={item}
          isDarkmode={isDarkmode}
        />
      </TouchableOpacity>
    );
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteTime = formatToLocalDateString(new Date(note.time));
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        noteTime.includes(searchQuery)
      );
    });
  }, [notes, searchQuery]);

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={{ padding: 20, alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
        testID="load-more"
          onPress={handleLoadMore}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 40,
            alignItems: "center",
            alignSelf: "center",
            borderWidth: 1,
            borderColor: "white",
            borderRadius: 10,
            marginVertical: 10,
            backgroundColor: theme.homeColor,
          }}
        >
          <Text testID = "load-more-button" style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>
            Load More
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text testID="empty-state-text" style={{ color: "gray", fontSize: 14 }}>
          No Results Found
        </Text>
      </View>
    );
  };

  const renderList = () => {
    let sortedNotes = [...filteredNotes];
    sortedNotes.sort((a, b) => {
      if (selectedSortOption === 1) {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      } else if (selectedSortOption === 2) {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else if (selectedSortOption === 3) {
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
      }
      return 0;
    });
    const dataToRender = isPrivate
      ? sortedNotes.filter((note) => !note.published)
      : sortedNotes.filter((note) => note.published);

    return dataToRender.length > 0 ? (
      <SwipeListView
        data={dataToRender}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListFooterComponent={renderFooter}
        initialNumToRender={21}
        disableVirtualization={true}
      />
    ) : (
      <View style={styles(theme, width).resultNotFound}>
        <LottieView
          source={require("../../assets/animations/noResultFound.json")}
          autoPlay
          loop
          style={styles(theme, width).lottie}
        />
        <Text testID="empty-state-text" style={styles(theme, width).resultNotFoundTxt}>
          No Results Found
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkmode ? "black" : "#e4e4e4" }}>
      <StatusBar translucent backgroundColor="transparent" />
      <View testID="Library" style={styles(theme, width).container}>
        <View style={styles(theme, width).topView}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingBottom: 15,
              paddingTop: 10,
            }}
          >
            <View style={styles(theme, width).userAccountAndPageTitle}>
              <TouchableOpacity
                testID="account-page"
                style={[
                  styles(theme, width).userPhoto,
                  {
                    backgroundColor: theme.black,
                    width: width > 1000 ? 50 : 30,
                    height: width > 1000 ? 50 : 30,
                  },
                ]}
                onPress={() => {
                  navigation.navigate("AccountPage");
                }}
              >
                <Text style={styles(theme, width).pfpText}>{userInitials}</Text>
              </TouchableOpacity>
              <Text style={styles(theme, width).pageTitle}>Library</Text>
            </View>
            <View testID="greeting-component" style={styles(theme, width).userWishContainer}>
              <Greeting />
              <Text style={styles(theme, width).userName}>{userName}</Text>
            </View>
          </View>
        </View>
        <View testID="Filter" style={[styles(theme, width).toolContainer, { marginHorizontal: 20 }]}>
          {!isSearchVisible && (
            <View style={styles(theme, width).publishedAndSortContainer}>
              <View style={styles(theme, width).publishedOrPrivateContainer}>
                <Pressable
                  onPress={() => {
                    setIsPrivate(false);
                    setPublished(true);
                  }}
                >
                  <View
                    testID="public-btn"
                    style={[
                      styles(theme, width).publishedTxtContainer,
                      { backgroundColor: isPrivate ? "transparent" : "black" },
                    ]}
                  >
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? "black" : "white" }]}>
                      Published
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsPrivate(true);
                    setPublished(false);
                  }}
                >
                  <View
                    testID="private-btn"
                    style={[
                      styles(theme, width).publishedTxtContainer,
                      { backgroundColor: isPrivate ? "black" : "transparent" },
                    ]}
                  >
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? "white" : "black" }]}>
                      Private
                    </Text>
                  </View>
                </Pressable>
              </View>
              <View>
                {!isSortOpened ? (
                  <TouchableOpacity testID="sort-button" onPress={handleSort}>
                    <MaterialIcons name="sort" size={30} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleSort}>
                    <MaterialIcons name="close" size={30} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          <View testID="SearchBar" style={[styles(theme, width).searchParentContainer, { width: isSearchVisible ? "95%" : 40 }]}>
            {isSearchVisible && (
              <Animated.View
                style={[
                  styles(theme, width).searchContainer,
                  { width: searchBarWidth, marginBottom: 23 },
                ]}
              >
                <TextInput
                  testID="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={(e) => setSearchQuery(e)}
                  style={[styles(theme, width).searchInput]}
                  cursorColor="black"
                  autoFocus={true}
                />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <View style={[styles(theme, width).searchIcon, { marginTop: -25 }]}>
                <TouchableOpacity testID="close-button" onPress={toggleSearchBar}>
                  <Ionicons name="close" size={25} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles(theme, width).searchIcon}>
                <TouchableOpacity testID="search-button" onPress={toggleSearchBar}>
                  <Ionicons name="search" size={25} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
      <View testID="notes-list" style={styles(theme, width).scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList()}
      </View>
      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />
      {isSortOpened && !isSearchVisible && (
        <View
          testID="sort-options"
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: isDarkmode ? "#525252" : "white",
            position: "absolute",
            top: "19%",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 20, color: isDarkmode ? "#c7c7c7" : "black", fontWeight: "600" }}>
            Sort by
          </Text>
          <View style={{ height: "50%", justifyContent: "space-evenly", alignItems: "center" }}>
            <TouchableOpacity onPress={() => handleSortOption({ option: 1 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 1 ? theme.homeColor : "none", width: 200 }]}>
                <Text style={{ fontSize: 20, color: isDarkmode && selectedSortOption !== 1 ? "#c7c7c7" : "black" }}>
                  Date & Time(latest)
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSortOption({ option: 2 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 2 ? theme.homeColor : "none" }]}>
                <Text style={{ fontSize: 20, color: isDarkmode && selectedSortOption !== 2 ? "#c7c7c7" : "black" }}>
                  A-Z
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSortOption({ option: 3 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 3 ? theme.homeColor : "none" }]}>
                <Text style={{ fontSize: 20, color: isDarkmode && selectedSortOption !== 3 ? "#c7c7c7" : "black" }}>
                  Z-A
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = (theme, width) =>
  StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      backgroundColor: theme.homeColor,
      height: width > 500 ? height * 0.12 : height * 0.19,
    },
    pfpText: {
      fontWeight: "600",
      fontSize: 14,
      alignSelf: "center",
      color: theme.white,
    },
    shareColor: {
      color: "green",
    },
    highlightColor: {
      color: theme.text,
    },
    backColor: {
      color: "red",
    },
    userPhoto: {
      height: width * 0.095,
      width: width * 0.095,
      borderRadius: 50,
      alignContent: "center",
      justifyContent: "center",
      backgroundColor: theme.black,
      marginLeft: 8,
    },
    noteTitle: {
      fontSize: 22,
      fontWeight: "700",
      maxWidth: "100%",
      flexShrink: 1,
      color: theme.text,
    },
    noteText: {
      marginTop: 10,
      fontSize: 18,
      color: theme.text,
    },
    scrollerBackgroundColor: {
      flex: 1,
      width: "100%",
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: theme.text,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      color: theme.text,
    },
    topView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 5,
      marginBottom: 0,
      marginTop: 10,
      backgroundColor: theme.homeColor,
    },
    rowBack: {
      width: "100%",
      height: 140,
      alignItems: "center",
      backgroundColor: theme.homeColor,
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 1,
      padding: 10,
      alignSelf: "center",
    },
    backRightBtn: {
      alignItems: "flex-end",
      bottom: 0,
      justifyContent: "center",
      position: "absolute",
      top: 0,
      width: 75,
      paddingRight: 17,
      color: theme.text,
    },
    backRightBtnRight: {
      backgroundColor: theme.homeGray,
      width: "50%",
      right: 0,
      color: theme.text,
    },
    userWishContainer: {
      marginRight: 10,
    },
    userName: {
      fontWeight: "500",
      height: "50%",
    },
    toolContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
    },
    publishedOrPrivateContainer: {
      backgroundColor: "#e7e7e7",
      height: 30,
      width: 120,
      borderRadius: 20,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
    },
    publishedAndSortContainer: {
      flexDirection: "row",
      width: width > 500 ? "20%" : "45%",
      justifyContent: "space-between",
    },
    publishedTxtContainer: {
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderRadius: 20,
    },
    publishedTxt: {
      color: "white",
      fontSize: 10,
      fontWeight: "600",
    },
    searchContainer: {
      right: 0,
      bottom: 0,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      height: 36,
      borderRadius: 25,
      overflow: "hidden",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "black",
      paddingHorizontal: 10,
      paddingVertical: 0,
      width: "100%",
    },
    searchIcon: {
      marginBottom: 10,
    },
    searchParentContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    userAccountAndPageTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: width > 500 ? "13%" : "27%",
    },
    pageTitle: {
      fontSize: 18,
      fontWeight: "500",
    },
    lottie: {
      width: 100,
      height: 200,
    },
    resultNotFound: {
      justifyContent: "center",
      alignItems: "center",
    },
    resultNotFoundTxt: {
      fontSize: 15,
      fontWeight: "400",
    },
    selectedSortOption: {
      width: width * 0.4,
      justifyContent: "center",
      alignItems: "center",
      padding: 10,
      borderRadius: 10,
    },
  });

export default Library;
