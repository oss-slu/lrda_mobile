import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import NoteSkeleton from "../components/noteSkeleton";
import { formatToLocalDateString } from "../components/time";
import { useTheme } from "../components/ThemeProvider";
import NoteDetailModal, { NoteDetailData } from "./mapPage/NoteDetailModal";
import Greeting from "../components/Greeting";
import NotesComponent from "../components/NotesComponent";
import LottieView from "lottie-react-native";
import { defaultTextFont } from "../../styles/globalStyles";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useUserInfo, useNotesList, useAnimatedSearch, sortNotes, filterNotes } from "../hooks/useNotesList";
import { useNoteListStyles } from "../../styles/noteListStyles";
import { SwipeListView } from "react-native-swipe-list-view";

const TEXT_LENGTH = 18;

const Library = () => {
  const router = useRouter();
  const { theme, isDarkmode } = useTheme();
  const styles = useNoteListStyles(theme);
  const { userInitials, userName } = useUserInfo();

  const [selectedNote, setSelectedNote] = useState<NoteDetailData | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);

  const { notes, rendering, hasMore, isLoadingMore, handleLoadMore } = useNotesList(
    () => ({ published: true }),
    [],
  );

  const { isSearchVisible, searchQuery, setSearchQuery, toggleSearchBar, searchBarWidth } = useAnimatedSearch();

  const displayNotes = sortNotes(filterNotes(notes, searchQuery), selectedSortOption);

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
        style={{ backgroundColor: isDarkmode ? "black" : "#e6e6e6" }}
        onPress={() => {
          if (!item.isPublished) {
            router.push({
              pathname: "/edit-note",
              params: { noteData: JSON.stringify({ ...item, time: item.time instanceof Date ? item.time.toISOString() : item.time }) },
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
    if (displayNotes.length === 0) {
      return (
        <View style={styles.resultNotFound}>
          <LottieView source={require("../../assets/animations/noResultFound.json")} autoPlay loop style={styles.lottie} />
          <Text style={styles.resultNotFoundTxt}>No Results Found</Text>
        </View>
      );
    }
    return (
      <SwipeListView
        data={displayNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: isLoadingMore ? 50 : 150 }}
        ListFooterComponent={renderFooter}
      />
    );
  };

  // Tutorial state
  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  const [libraryTip, setLibraryTip] = useState(false);

  useEffect(() => {
    getHasDoneTutorial("Library").then((done) => {
      setUserTutorial(done);
      if (!done) setLibraryTip(true);
    });
  }, []);

  return (
    <View testID="Library" style={{ flex: 1, backgroundColor: isDarkmode ? "black" : "#e4e4e4" }}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.topView}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", paddingBottom: 15, paddingTop: 10 }}>
            <View style={styles.userAccountAndPageTitle}>
              <TouchableOpacity
                testID="account-page"
                style={[styles.userPhoto, { backgroundColor: theme.black, width: Dimensions.get("window").width > 1000 ? 50 : 30, height: Dimensions.get("window").width > 1000 ? 50 : 30 }]}
                onPress={() => router.push("/account")}
              >
                <Text style={styles.pfpText}>{userInitials}</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Library</Text>
            </View>
            <View testID="greeting-component" style={styles.userWishContainer}>
              <Greeting />
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
        </View>

        <View testID="Filter" style={[styles.toolContainer, { marginHorizontal: 20 }]}>
          {!isSearchVisible && (
            <View>
              {!isSortOpened ? (
                <TouchableOpacity onPress={() => setIsSortOpened(true)}>
                  <MaterialIcons name="sort" size={30} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsSortOpened(false)}>
                  <MaterialIcons name="close" size={30} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <View testID="SearchBar" style={[styles.searchParentContainer, { width: isSearchVisible ? "95%" : 40 }]}>
            {isSearchVisible && (
              <Animated.View style={[styles.searchContainer, { width: searchBarWidth, marginBottom: 23 }]}>
                <TextInput placeholder="Search..." value={searchQuery} placeholderTextColor="#999" onChangeText={setSearchQuery} style={styles.searchInput} cursorColor="black" autoFocus />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <View style={[styles.searchIcon, { marginTop: -25 }]}>
                <TouchableOpacity onPress={toggleSearchBar} testID="close-button">
                  <Ionicons name="close" size={25} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchIcon}>
                <TouchableOpacity onPress={toggleSearchBar} testID="search-button">
                  <Ionicons name="search" size={25} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <View testID="notes-list" style={styles.scrollerBackgroundColor}>
        {rendering ? (
          <NoteSkeleton />
        ) : (
          <Tooltip
            isVisible={libraryTip && !userTutorial}
            showChildInTooltip={false}
            topAdjustment={Platform.OS === "android" ? -400 : -400}
            displayInsets={{ top: 20, bottom: 20, left: 10, right: 10 }}
            content={
              <TooltipContent
                message="Welcome to library! Scroll to view all published notes from other creators."
                onPressOk={() => { setUserTutorial(true); setLibraryTip(false); setTutorialDone("Library", true); }}
                onSkip={() => { setUserTutorial(true); setLibraryTip(false); setTutorialDone("Library", true); }}
              />
            }
            placement="bottom"
          >
            {renderList()}
          </Tooltip>
        )}
      </View>

      {isSortOpened && !isSearchVisible && (
        <View style={[libraryStyles.sortOverlay, { backgroundColor: isDarkmode ? "#525252" : "white" }]}>
          <Text style={{ ...defaultTextFont, fontSize: 20, color: isDarkmode ? "#c7c7c7" : "black", fontWeight: "600" }}>Sort by</Text>
          <View style={{ height: "50%", justifyContent: "space-evenly", alignItems: "center" }}>
            {[
              { option: 1, label: "Date & Time(latest)" },
              { option: 2, label: "A-Z" },
              { option: 3, label: "Z-A" },
            ].map(({ option, label }) => (
              <TouchableOpacity key={option} onPress={() => { setSelectedSortOption(option); setIsSortOpened(false); }}>
                <View style={[styles.selectedSortOption, { backgroundColor: selectedSortOption === option ? theme.homeColor : "transparent", width: 200 }]}>
                  <Text style={{ ...defaultTextFont, fontSize: 20, color: isDarkmode && selectedSortOption !== option ? "#c7c7c7" : "black" }}>
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </View>
  );
};

const libraryStyles = StyleSheet.create({
  sortOverlay: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: "19%",
    borderRadius: 20,
    padding: 20,
  },
});

export default Library;
