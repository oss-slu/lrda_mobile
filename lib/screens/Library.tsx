import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { Note } from "../../types";
import { HomeScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";
import { SwipeListView } from "react-native-swipe-list-view";
import NoteSkeleton from "../components/noteSkeleton";
import LoadingImage from "../components/loadingImage";
import { formatToLocalDateString } from "../components/time";
import { useTheme } from "../components/ThemeProvider";
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";
import NoteDetailModal from "./mapPage/NoteDetailModal";
import ToastMessage from "react-native-toast-message";
import { useAddNoteContext } from "../context/AddNoteContext";
import Greeting from "../components/Greeting";
import NotesComponent from "../components/NotesComponent";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { defaultTextFont } from "../../styles/globalStyles";

const user = User.getInstance();
const { width, height } = Dimensions.get("window");

const limit = 20;

const Library = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isFilterOpned, setIsFilterOpned] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [published, setPublished] = useState(true);
  const [reversed, setReversed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  const [initialItems, setInitialItems] = useState([
    { label: "My Entries", value: "my_entries" },
    { label: "Published Entries", value: "published_entries" },
  ]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const { theme, isDarkmode } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);
  const animation = useRef(new Animated.Value(0)).current; // Animation value
  const screenWidth = Dimensions.get("window").width; // Screen width for full reveal

  let textLength = 18;

  // Pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      const name = await user.getName();
      setUserName(name);
      if (name) {
        const initials = name.split(" ").map((namePart) => namePart[0]).join("");
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
    fetchMessages(1);
  }, [updateCounter, published]);

  const fetchMessages = async (pageNum: number) => {
    try {
      // Calculate skip using the current page number
      const skip = (pageNum - 1) * limit;
      // Get userId if needed
      const userId = await user.getId();
      // Use batch-fetching with skip and limit; note we use isPrivate state
      const data = await ApiService.fetchMapsMessagesBatch(
          isPrivate,
          published,
          isPrivate ? userId : "",
          limit,
          skip
      );
      // Filter out archived notes; assume notes without `isArchived` are not archived
      const publicNotes = data.filter((note: Note) => !note.isArchived && note.published);
      // Convert data and sort notes by date (latest first)
      const fetchedNotes = DataConversion.convertMediaTypes(publicNotes)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      const finalNotes = reversed ? fetchedNotes.reverse() : fetchedNotes;
  
      if (pageNum === 1) {
        setNotes(finalNotes);
      } else {
        setNotes((prev) => [...prev, ...finalNotes]);
      }
  
      setHasMore(finalNotes.length === limit);
      setRendering(false);
    } catch (error) {
      console.error("Error fetching public notes:", error);
      ToastMessage.show({
        type: "error",
        text1: "Error fetching notes",
        text2: error.message,
      });
      setRendering(false);
    }
  };

  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      await fetchMessages(nextPage);
      setPage(nextPage);
      setIsLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View  style={{ paddingVertical: 50, alignItems: "center", marginBottom: 100 }}>
          <ActivityIndicator size="small" color={theme.text} />
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
          width: "65%",
          alignItems: "center",
          alignSelf: "center",
          borderRadius: 20,
          marginVertical: 4, // reduced from 8
          backgroundColor: theme.homeColor,
        }}
      >
        <Text testID="load-more-button" style={{ ...defaultTextFont ,color: theme.text, fontSize: 16, fontWeight: "400" }}>
          Load More
        </Text>
      </TouchableOpacity>
      );
    }
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text testID="empty-state-text" style={{ ...defaultTextFont, color: "gray", fontSize: 14 }}>
          End of the Page
        </Text>
      </View>
    );
  };

  const toggleSearchBar = () => {
    if (isSearchVisible) {
      setSearchQuery('');
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      setIsSearchVisible(true);
      Animated.timing(animation, {
        toValue: screenWidth - 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const searchBarWidth = animation.interpolate({
    inputRange: [0, screenWidth],
    outputRange: [0, screenWidth],
  });

  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const renderList = (notes: Note[]) => {
    // Filter notes if there's a search query.
    const filteredNotes = searchQuery
      ? notes.filter((note) => {
          const lowerCaseQuery = searchQuery.toLowerCase();
          const noteTime = new Date(note.time);
          const formattedTime = formatToLocalDateString(noteTime);
          return (
            note.title.toLowerCase().includes(lowerCaseQuery) ||
            formattedTime.includes(lowerCaseQuery)
          );
        })
      : notes;
    
    // Only apply sort if there's an active search query.
    // Otherwise, display the notes in the natural order they are stored.
    const displayNotes = searchQuery
      ? filteredNotes.sort((a, b) => {
          // (Your sorting logic here if needed when filtering)
          if (selectedSortOption === 1) {
            return new Date(b.time).getTime() - new Date(a.time).getTime();
          } else if (selectedSortOption === 2) {
            return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          } else if (selectedSortOption === 3) {
            return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
          }
          return 0;
        })
      : filteredNotes;
    
    return published && (
      displayNotes.length > 0 ? (
        <SwipeListView
          data={displayNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: isLoadingMore ? 50 : 150 }}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles(theme, width).resultNotFound}>
          <LottieView
            source={require('../../assets/animations/noResultFound.json')}
            autoPlay
            loop
            style={styles(theme, width).lottie}
          />
          <Text style={styles(theme, width).resultNotFoundTxt}>No Results Found</Text>
        </View>
      )
    );
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

    const resolvedImageURI = Platform.OS === "android" ? String(ImageURI || "") : ImageURI;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={{ backgroundColor: isDarkmode ? 'black' : '#e6e6e6' }}
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

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  //handle sort
  const handleSort = () => {
    setIsSortOpened(!isSortOpened);
  };

  const handleSortOption = ({ option }) => {
    setSelectedSortOption(option);
    setIsSortOpened(false);
  };

  return (
    <View testID="Library" style={{ flex: 1, backgroundColor: isDarkmode ? 'black' : '#e4e4e4' }}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles(theme, width).container}>
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
          {
            !isSearchVisible && (
              <View>
                {
                  !isSortOpened ? (
                    <TouchableOpacity onPress={handleSort}>
                      <MaterialIcons name='sort' size={30} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleSort}>
                      <MaterialIcons name='close' size={30} />
                    </TouchableOpacity>
                  )
                }
              </View>
            )
          }
          <View testID="SearchBar" style={[styles(theme, width).searchParentContainer, { width: isSearchVisible ? '95%' : 40 }]}>
            {isSearchVisible && (
              <Animated.View
                style={[
                  styles(theme, width).searchContainer,
                  { width: searchBarWidth, marginBottom: 23 },
                ]}
              >
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={(e) => setSearchQuery(e)}
                  style={[styles(theme, width).searchInput]}
                  cursorColor={'black'}
                  autoFocus={true}
                />
              </Animated.View>
            )}
            {
              isSearchVisible ? (
                <View style={[styles(theme, width).seachIcon, { marginTop: -25 }]}>
                  <TouchableOpacity onPress={toggleSearchBar} testID="close-button">
                    <Ionicons name="close" size={25} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles(theme, width).seachIcon}>
                  <TouchableOpacity onPress={toggleSearchBar} testID="search-button">
                    <Ionicons name="search" size={25} />
                  </TouchableOpacity>
                </View>
              )
            }
          </View>
        </View>
      </View>
  
      <View testID="notes-list" style={styles(theme, width).scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList(notes)}
      </View>
  
      {isSortOpened && isSearchVisible == false && (
        <View style={{
          height: "100%",
          width: '100%',
          backgroundColor: isDarkmode ? '#525252' : 'white',
          position: 'absolute',
          top: '19%',
          borderRadius: 20,
          padding: 20,
        }}>
          <Text style={{ ...defaultTextFont ,fontSize: 20, color: isDarkmode ? '#c7c7c7' : 'black', fontWeight: 600 }}>
            Sort by
          </Text>
          <View style={{ height: '50%', justifyContent: 'space-evenly', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => handleSortOption({ option: 1 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 1 ? theme.homeColor : 'none', width: 200 }]}>
                <Text style={{ ...defaultTextFont, fontSize: 20, color: isDarkmode && selectedSortOption != 1 ? '#c7c7c7' : 'black' }}>
                  Date & Time(latest)
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSortOption({ option: 2 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 2 ? theme.homeColor : 'none' }]}>
                <Text style={{ ...defaultTextFont,fontSize: 20, color: isDarkmode && selectedSortOption != 2 ? '#c7c7c7' : 'black' }}>
                  A-Z
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSortOption({ option: 3 })}>
              <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 3 ? theme.homeColor : 'none' }]}>
                <Text style={{ ...defaultTextFont, fontSize: 20, color: isDarkmode && selectedSortOption != 3 ? '#c7c7c7' : 'black' }}>
                  Z-A
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />
    </View>
  );
};
  
const styles = (theme, width, color, isDarkmode) =>
  StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      height: width > 500 ? height * 0.12 : height * 0.19,
      backgroundColor: theme.homeColor,
    },
    pfpText: {
      ...defaultTextFont,
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
      ...defaultTextFont,
      fontSize: 22,
      fontWeight: "700",
      maxWidth: "100%",
      flexShrink: 1,
      color: theme.text,
    },
    noteText: {
      ...defaultTextFont,
      marginTop: 10,
      fontSize: 18,
      color: theme.text,
    },
    scrollerBackgroundColor: {
      flex: 1,
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
    dropdown: {
      width: "100%",
      alignItems: "center",
      zIndex: 1000,
      marginTop: -13,
    },
    noteContainer: {
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.primaryColor,
      marginTop: 1,
      width: "100%",
      flexDirection: "row",
      height: 185,
      paddingLeft: width * 0.03,
      paddingRight: width * 0.03,
      color: theme.text,
    },
    rowBack: {
      width: "100%",
      height: 140,
      alignItems: "center",
      backgroundColor: theme.homeGray,
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
      ...defaultTextFont,
      fontWeight: "500",
      height: "50%",
    },
    toolContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
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
      ...defaultTextFont,
      flex: 1,
      fontSize: 16,
      color: "black",
      paddingHorizontal: 10,
      paddingVertical: 0,
      width: "100%",
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
      ...defaultTextFont,
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
      ...defaultTextFont,
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
