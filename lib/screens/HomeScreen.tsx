import React, { useState, useEffect, useCallback } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { updateNote as apiUpdateNote } from "../utils/api_calls";
import { Note } from "../../types";
import { SwipeListView } from "react-native-swipe-list-view";
import NoteSkeleton from "../components/noteSkeleton";
import { formatToLocalDateString } from "../components/time";
import { useTheme } from "../components/ThemeProvider";
import NoteDetailModal, { NoteDetailData } from "./mapPage/NoteDetailModal";
import ToastMessage from "react-native-toast-message";
import NotesComponent from "../components/NotesComponent";
import Greeting from "../components/Greeting";
import { useAddNoteContext } from "../context/AddNoteContext";
import LottieView from "lottie-react-native";
import { useAddNoteStore } from "../stores/addNoteStore";
import { defaultTextFont } from "../../styles/globalStyles";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { useRouter } from "expo-router";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useUserInfo, useNotesList, useAnimatedSearch, sortNotes, filterNotes } from "../hooks/useNotesList";
import { useNoteListStyles } from "../../styles/noteListStyles";

const { width } = Dimensions.get("window");
const TEXT_LENGTH = 18;

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { theme, isDarkmode } = useTheme();
  const styles = useNoteListStyles(theme);
  const { authUser, userInitials, userName } = useUserInfo();
  const { setNavigateToAddNote } = useAddNoteContext();
  const toggleAddNoteState = useAddNoteStore((s) => s.toggleAddNoteState);

  const [isPrivate, setIsPrivate] = useState(true);
  const [published, setPublished] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteDetailData | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);

  const { notes, setNotes, rendering, hasMore, isLoadingMore, handleLoadMore, refreshPage } = useNotesList(
    () => ({
      creatorId: authUser?.id || undefined,
      published: published ? true : authUser?.id ? false : undefined,
    }),
    [published],
  );

  const { isSearchVisible, searchQuery, setSearchQuery, toggleSearchBar, searchBarWidth } = useAnimatedSearch();

  useEffect(() => {
    const navigateToAddNote = () => {
      const untitledNumber = findNextUntitledNumber(notes);
      router.push({ pathname: "/add-note", params: { untitledNumber: String(untitledNumber) } });
    };
    setNavigateToAddNote(() => navigateToAddNote);
  }, [router, notes]);

  const updateNote = (note: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    refreshPage();
  };

  const handleArchiveNote = async (note: Note | undefined) => {
    if (note?.id) {
      try {
        const updatedNote = { ...note, isPublished: false };
        await apiUpdateNote(updatedNote);
        ToastMessage.show({ type: "success", text1: "Success", text2: "Note successfully archived." });
        updateNote(updatedNote);
        return true;
      } catch (error) {
        ToastMessage.show({ type: "error", text1: "Error", text2: "Failed to archive note. System failure. Try again later." });
        console.error("Error archiving note:", error);
        return false;
      }
    } else {
      ToastMessage.show({ type: "error", text1: "Error", text2: "You must first save your note before archiving it." });
      return false;
    }
  };

  const findNextUntitledNumber = (notes: Note[]): number => {
    return (
      notes.reduce((max, note) => {
        const match = note.title.match(/^Untitled (\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0) + 1
    );
  };

  const deleteNote = (id: string, rowMap: any) => {
    if (rowMap[id]) rowMap[id].closeRow();
    const noteToDelete = notes.find((note) => note.id === id);
    if (noteToDelete) handleArchiveNote(noteToDelete);
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const publishNote = async (id: string, rowMap: any) => {
    if (rowMap[id]) rowMap[id].closeRow();
    const found = notes.find((note) => note.id === id);
    if (!found) return;
    const editedNote: Note = { ...found, isPublished: !found.isPublished };
    await apiUpdateNote(editedNote);
    refreshPage();
  };

  const displayNotes = sortNotes(filterNotes(notes, searchQuery), selectedSortOption);
  const privateData = displayNotes.filter((n) => !n.isPublished);
  const publicData = displayNotes.filter((n) => n.isPublished);
  const listData = isPrivate ? privateData : publicData;

  const renderItem = (data: any) => {
    const item = data.item;
    const showTime = formatToLocalDateString(new Date(item.time));
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
        style={{ backgroundColor: isDarkmode ? "black" : "#e6e6e6", width: "100%" }}
        onPress={() => {
          if (!item.isPublished) {
            toggleAddNoteState();
            router.push({
              pathname: "/edit-note",
              params: { noteData: JSON.stringify({ ...item, time: item.time.toISOString() }) },
            });
          } else {
            setSelectedNote({
              ...item,
              time: formatToLocalDateString(new Date(item.time)),
              description: item.text,
              images: item.media.map((m: { uri: string }) => ({ uri: m.uri })),
            });
            setModalVisible(true);
          }
        }}
      >
        <NotesComponent
          IsImage={IsImage}
          resolvedImageURI={resolvedImageURI}
          ImageType={ImageType}
          textLength={TEXT_LENGTH}
          showTime={showTime}
          item={item}
          isPublished={item.isPublished}
          isDarkmode={isDarkmode}
        />
      </TouchableOpacity>
    );
  };

  const sideMenu = (data: any, rowMap: any) => {
    const isNotePublished = data.item.isPublished;
    return (
      <View style={homeStyles.rowBack} key={data.index}>
        <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
          <Ionicons name={isNotePublished ? "arrow-undo" : "share"} size={30} color="green" />
        </TouchableOpacity>
        <View style={[homeStyles.backRightBtn, { backgroundColor: theme.homeGray }]}>
          {isPrivate && (
            <TouchableOpacity
              style={{ justifyContent: "center", alignItems: "center", position: "absolute", right: 20 }}
              onPress={() => deleteNote(data.item.id, rowMap)}
            >
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={{ paddingVertical: 50, alignItems: "center", marginBottom: 100 }}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          testID="load-more"
          onPress={handleLoadMore}
          style={{ paddingVertical: 20, width: "65%", alignItems: "center", alignSelf: "center", borderRadius: 20, marginVertical: 4, backgroundColor: theme.homeColor }}
        >
          <Text testID="load-more-button" style={{ ...defaultTextFont, color: theme.text, fontSize: 16, fontWeight: "400" }}>Load More</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text testID="empty-state-text" style={{ ...defaultTextFont, color: "gray", fontSize: 14 }}>End of the Page</Text>
      </View>
    );
  };

  const renderList = () => {
    if (listData.length === 0) {
      return (
        <View style={styles.resultNotFound}>
          <LottieView testID="no-results-animation" source={require("../../assets/animations/noResultFound.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.resultNotFoundTxt}>No Results Found</Text>
        </View>
      );
    }
    return (
      <SwipeListView
        data={listData}
        renderItem={renderItem}
        renderHiddenItem={sideMenu}
        leftActivationValue={160}
        rightActivationValue={isPrivate ? -160 : undefined}
        leftOpenValue={75}
        rightOpenValue={isPrivate ? -75 : undefined}
        stopLeftSwipe={175}
        stopRightSwipe={isPrivate ? -175 : undefined}
        keyExtractor={(item) => item.id}
        onRightAction={isPrivate ? (data, rowMap) => deleteNote(data, rowMap) : undefined}
        onLeftAction={(data, rowMap) => publishNote(data, rowMap)}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListFooterComponent={renderFooter}
      />
    );
  };

  // Tutorial state
  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  const [accountTip, setAccountTip] = useState(false);
  const [filterToolTip, setFilterToolTip] = useState(false);
  const [searchTip, setSearchTip] = useState(false);
  const [pubPrivTip, setPubPrivTip] = useState(false);

  useEffect(() => {
    getHasDoneTutorial("HomeScreen").then((done) => {
      setUserTutorial(done);
      if (!done) setAccountTip(true);
    });
  }, []);

  const skipTutorial = () => {
    setAccountTip(false);
    setSearchTip(false);
    setFilterToolTip(false);
    setPubPrivTip(false);
    setTutorialDone("HomeScreen", true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkmode ? "black" : "#e4e4e4" }}>
      <StatusBar translucent backgroundColor="transparent" />
      <View testID="HomeScreen" style={styles.container}>
        <View style={styles.topView}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingBottom: 15, paddingTop: 10 }}>
            <View style={styles.userAccountAndPageTitle}>
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight : 0}
                showChildInTooltip={false}
                isVisible={accountTip && !userTutorial}
                content={
                  <TooltipContent message="See account information here." onPressOk={() => { setAccountTip(false); setSearchTip(true); }} onSkip={skipTutorial} />
                }
                placement="bottom"
              >
                <TouchableOpacity
                  testID="user-account"
                  style={[styles.userPhoto, { backgroundColor: theme.black, width: width > 1000 ? 50 : 30, height: width > 1000 ? 50 : 30 }]}
                  onPress={() => router.push("/account")}
                >
                  <Text style={styles.pfpText}>{userInitials}</Text>
                </TouchableOpacity>
              </Tooltip>
              <Text style={styles.pageTitle}>Notes</Text>
            </View>
            <View testID="greeting-component" style={styles.userWishContainer}>
              <Greeting />
              <Text testID="user-name" style={styles.userName}>{userName}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.toolContainer, { marginHorizontal: 20 }]}>
          {!isSearchVisible && (
            <View style={homeStyles.publishedAndSortContainer}>
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight : 0}
                showChildInTooltip={false}
                isVisible={pubPrivTip && !userTutorial}
                content={
                  <TooltipContent message="Switch between your published and privated notes with this switch" onPressOk={() => { setPubPrivTip(false); setTutorialDone("HomeScreen", true); }} onSkip={skipTutorial} />
                }
                placement="bottom"
              >
                <View style={homeStyles.publishedOrPrivateContainer}>
                  <Pressable onPress={() => { setIsPrivate(false); setPublished(true); }}>
                    <View testID="public-btn" style={[homeStyles.publishedTxtContainer, { backgroundColor: isPrivate ? "transparent" : "black" }]}>
                      <Text style={[homeStyles.publishedTxt, { color: isPrivate ? "black" : "white" }]}> Published</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => { setIsPrivate(true); setPublished(false); }}>
                    <View testID="private-btn" style={[homeStyles.publishedTxtContainer, { backgroundColor: isPrivate ? "black" : "transparent" }]}>
                      <Text style={[homeStyles.publishedTxt, { color: isPrivate ? "white" : "black" }]}>Private</Text>
                    </View>
                  </Pressable>
                </View>
              </Tooltip>
              <View>
                {!isSortOpened ? (
                  <Tooltip
                    topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight : 0}
                    isVisible={filterToolTip && !userTutorial}
                    content={
                      <TooltipContent message="Filter your notes with this!" onPressOk={() => { setFilterToolTip(false); setPubPrivTip(true); }} onSkip={skipTutorial} />
                    }
                    placement="bottom"
                  >
                    <TouchableOpacity testID="sort-button" onPress={() => setIsSortOpened(true)}>
                      <MaterialIcons name="sort" size={30} />
                    </TouchableOpacity>
                  </Tooltip>
                ) : (
                  <TouchableOpacity onPress={() => setIsSortOpened(false)}>
                    <MaterialIcons name="close" size={30} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          <View style={[styles.searchParentContainer, { width: isSearchVisible ? "95%" : 40 }]}>
            {isSearchVisible && (
              <Animated.View style={[styles.searchContainer, { width: searchBarWidth, marginBottom: 23 }]}>
                <TextInput testID="search-input" placeholder="Search..." value={searchQuery} placeholderTextColor="#999" onChangeText={setSearchQuery} style={styles.searchInput} cursorColor="black" autoFocus />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <View style={[styles.searchIcon, { marginTop: -25 }]}>
                <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                  <Ionicons name="close" size={25} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchIcon}>
                <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                  <Tooltip
                    topAdjustment={Platform.OS === "android" ? -StatusBar.currentHeight : 0}
                    isVisible={searchTip && !userTutorial}
                    content={
                      <TooltipContent message="Try out our search bar!" onPressOk={() => { setSearchTip(false); setFilterToolTip(true); }} onSkip={skipTutorial} />
                    }
                    placement="bottom"
                  >
                    <Ionicons name="search" size={25} />
                  </Tooltip>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <View testID="notes-list" style={styles.scrollerBackgroundColor}>
        {rendering ? <NoteSkeleton /> : renderList()}
      </View>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />

      {isSortOpened && !isSearchVisible && (
        <View testID="sort-options" style={[homeStyles.sortDropdown, { backgroundColor: isDarkmode ? "#525252" : "white" }]}>
          <Text style={{ ...defaultTextFont, fontSize: 16, fontWeight: "600", marginBottom: 10, color: isDarkmode ? "#c7c7c7" : "black" }}>Sort by</Text>
          <View style={{ height: "50%", justifyContent: "space-evenly", alignItems: "center" }}>
            {[
              { option: 1, label: "Date & Time(latest)" },
              { option: 2, label: "A-Z" },
              { option: 3, label: "Z-A" },
            ].map(({ option, label }) => (
              <TouchableOpacity key={option} onPress={() => { setSelectedSortOption(option); setIsSortOpened(false); }}>
                <View style={[styles.selectedSortOption, { backgroundColor: selectedSortOption === option ? theme.homeColor : "transparent", width: 200 }]}>
                  <Text style={{ ...defaultTextFont, fontSize: 14, paddingVertical: 6, color: isDarkmode && selectedSortOption !== option ? "#ccc" : "#000" }}>
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const homeStyles = StyleSheet.create({
  rowBack: {
    width: "100%",
    height: 140,
    alignItems: "center",
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
    width: "50%",
    right: 0,
    paddingRight: 17,
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
    width: Dimensions.get("window").width > 500 ? "20%" : "45%",
    justifyContent: "space-between",
  },
  publishedTxtContainer: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 20,
  },
  publishedTxt: {
    ...defaultTextFont,
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  sortDropdown: {
    position: "absolute",
    top: 120,
    right: 20,
    width: 200,
    borderRadius: 12,
    padding: 10,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default HomeScreen;
