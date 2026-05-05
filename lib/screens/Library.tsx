import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
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
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useUserInfo, useNotesList, useAnimatedSearch, sortNotes, filterNotes } from "../hooks/useNotesList";
import { SwipeListView } from "react-native-swipe-list-view";
import Constants from "expo-constants";

const TEXT_LENGTH = 18;
const { width, height } = Dimensions.get("window");

const Library = () => {
  const router = useRouter();
  const { colors, isDarkmode, accentColor } = useTheme();
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
    const ImageType = mediaItem?.type;
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.uri;
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.thumbnail;
      IsImage = true;
    }
    const resolvedImageURI = Platform.OS === "android" ? String(ImageURI || "") : ImageURI;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        className="bg-secondary"
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
        <View className="py-[50px] items-center mb-[100px]">
          <ActivityIndicator size="small" color={colors.foreground} />
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          testID="load-more"
          onPress={handleLoadMore}
          className="py-5 w-[65%] items-center self-center rounded-lg my-1 bg-accent"
        >
          <Text testID="load-more-button" className="font-inter text-foreground text-base font-normal">Load More</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View className="p-5 items-center">
        <Text testID="empty-state-text" className="font-inter text-gray-500 text-sm">End of the Page</Text>
      </View>
    );
  };

  const renderList = () => {
    if (displayNotes.length === 0) {
      return (
        <View className="justify-center items-center">
          <LottieView source={require("../../assets/animations/noResultFound.json")} autoPlay loop style={{ width: 100, height: 200 }} />
          <Text className="font-inter text-[15px] font-normal">No Results Found</Text>
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

  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  const [libraryTip, setLibraryTip] = useState(false);

  useEffect(() => {
    getHasDoneTutorial("Library").then((done) => {
      setUserTutorial(done);
      if (!done) setLibraryTip(true);
    });
  }, []);

  return (
    <View testID="Library" className="flex-1 bg-secondary">
      <StatusBar translucent backgroundColor="transparent" />
      <View
        className="bg-accent"
        style={{ paddingTop: Constants.statusBarHeight - 20, height: width > 500 ? height * 0.12 : height * 0.19 }}
      >
        <View className="flex-row items-center justify-between px-[5px] mb-0 mt-2.5 bg-accent">
          <View className="flex-row items-center justify-between pb-[15px] pt-2.5 w-full">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                testID="account-page"
                className="rounded-full items-center justify-center bg-foreground ml-2"
                style={{ width: width > 1000 ? 50 : 30, height: width > 1000 ? 50 : 30 }}
                onPress={() => router.push("/account")}
              >
                <Text className="font-inter font-semibold text-sm self-center text-surface">{userInitials}</Text>
              </TouchableOpacity>
              <Text className="font-inter text-lg font-medium">Library</Text>
            </View>
            <View testID="greeting-component" className="mr-2.5">
              <Greeting />
              <Text className="font-inter font-medium h-[50%] text-center self-center">{userName}</Text>
            </View>
          </View>
        </View>

        <View testID="Filter" className="flex-row justify-between items-center mt-2.5 mx-5">
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
          <View testID="SearchBar" className="flex-row justify-between items-center" style={{ width: isSearchVisible ? "95%" : 40 }}>
            {isSearchVisible && (
              <Animated.View
                className="right-0 bottom-0 bg-[#f0f0f0] justify-center items-center h-[36px] rounded-full overflow-hidden mb-[23px]"
                style={{ width: searchBarWidth }}
              >
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={setSearchQuery}
                  className="font-inter flex-1 text-base text-black px-[10px] py-0 w-full"
                  cursorColor="black"
                  autoFocus
                />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <TouchableOpacity onPress={toggleSearchBar} testID="close-button">
                <Ionicons name="close" size={25} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={toggleSearchBar} testID="search-button">
                <Ionicons name="search" size={25} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View testID="notes-list" className="flex-1 w-full">
        {rendering ? (
          <NoteSkeleton />
        ) : (
          <Tooltip
            isVisible={libraryTip && !userTutorial}
            showChildInTooltip={false}
            topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
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
        <View className="h-full w-full absolute top-[19%] rounded-lg p-5 bg-surface dark:bg-tertiary">
          <Text className="font-inter text-xl text-foreground font-semibold">Sort by</Text>
          <View className="h-[50%] justify-evenly items-center">
            {[
              { option: 1, label: "Date & Time(latest)" },
              { option: 2, label: "A-Z" },
              { option: 3, label: "Z-A" },
            ].map(({ option, label }) => (
              <TouchableOpacity key={option} onPress={() => { setSelectedSortOption(option); setIsSortOpened(false); }}>
                <View
                  className="w-[200px] justify-center items-center p-[10px] rounded-[10px]"
                  style={{ backgroundColor: selectedSortOption === option ? accentColor : "transparent" }}
                >
                  <Text className={`font-inter text-xl ${selectedSortOption === option ? "text-black" : "text-foreground"}`}>
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

export default Library;
