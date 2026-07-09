import React, { useState, useEffect } from "react";
import { Platform, View, Text, TouchableOpacity, Dimensions, TextInput, Animated, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import NoteSkeleton from "../components/noteSkeleton";
import { useTheme } from "../components/ThemeProvider";
import Greeting from "../components/Greeting";
import NotesList from "../components/NotesList";
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useUserInfo, useNotesList, useAnimatedSearch, sortNotes, filterNotes } from "../hooks/useNotesList";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

const Library = () => {
  const router = useRouter();
  const { accentColor } = useTheme();
  const { userInitials, userName } = useUserInfo();

  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);

  const { notes, rendering, hasMore, isLoadingMore, handleLoadMore } = useNotesList({ published: true });

  const { isSearchVisible, searchQuery, setSearchQuery, toggleSearchBar, searchBarWidth } = useAnimatedSearch();

  const displayNotes = sortNotes(filterNotes(notes, searchQuery), selectedSortOption);

  const renderList = () => <NotesList notes={displayNotes} hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={handleLoadMore} />;

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
        <View className="mb-0 mt-2.5 flex-row items-center justify-between bg-accent px-[5px]">
          <View className="w-full flex-row items-center justify-between pb-[15px] pt-2.5">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                testID="account-page"
                className="ml-2 items-center justify-center rounded-full bg-foreground"
                style={{ width: width > 1000 ? 50 : 30, height: width > 1000 ? 50 : 30 }}
                onPress={() => router.push("/account")}
              >
                <Text className="self-center font-inter text-sm font-semibold text-surface">{userInitials}</Text>
              </TouchableOpacity>
              <Text className="font-inter text-lg font-medium">Library</Text>
            </View>
            <View testID="greeting-component" className="mr-2.5">
              <Greeting />
              <Text className="h-[50%] self-center text-center font-inter font-medium">{userName}</Text>
            </View>
          </View>
        </View>

        <View testID="Filter" className="mx-5 mt-2.5 flex-row items-center justify-between">
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
          <View testID="SearchBar" className="flex-row items-center justify-between" style={{ width: isSearchVisible ? "95%" : 40 }}>
            {isSearchVisible && (
              <Animated.View
                className="bottom-0 right-0 mb-[23px] h-[36px] items-center justify-center overflow-hidden rounded-full bg-[#f0f0f0]"
                style={{ width: searchBarWidth }}
              >
                <TextInput
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={setSearchQuery}
                  className="w-full flex-1 px-[10px] py-0 font-inter text-base text-black"
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

      <View testID="notes-list" className="w-full flex-1">
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
                onPressOk={() => {
                  setUserTutorial(true);
                  setLibraryTip(false);
                  setTutorialDone("Library", true);
                }}
                onSkip={() => {
                  setUserTutorial(true);
                  setLibraryTip(false);
                  setTutorialDone("Library", true);
                }}
              />
            }
            placement="bottom"
          >
            {renderList()}
          </Tooltip>
        )}
      </View>

      {isSortOpened && !isSearchVisible && (
        <View className="absolute top-[19%] h-full w-full rounded-lg bg-surface p-5 dark:bg-tertiary">
          <Text className="font-inter text-xl font-semibold text-foreground">Sort by</Text>
          <View className="h-[50%] items-center justify-evenly">
            {[
              { option: 1, label: "Date & Time(latest)" },
              { option: 2, label: "A-Z" },
              { option: 3, label: "Z-A" },
            ].map(({ option, label }) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedSortOption(option);
                  setIsSortOpened(false);
                }}
              >
                <View
                  className="w-[200px] items-center justify-center rounded-[10px] p-[10px]"
                  style={{ backgroundColor: selectedSortOption === option ? accentColor : "transparent" }}
                >
                  <Text className={`font-inter text-xl ${selectedSortOption === option ? "text-black" : "text-foreground"}`}>{label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default Library;
