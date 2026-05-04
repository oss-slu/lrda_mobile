import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
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
import Tooltip from "react-native-walkthrough-tooltip";
import TooltipContent from "../onboarding/TooltipComponent";
import { useRouter } from "expo-router";
import { getHasDoneTutorial, setTutorialDone } from "../utils/tutorial";
import { useUserInfo, useNotesList, useAnimatedSearch, sortNotes, filterNotes } from "../hooks/useNotesList";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");
const TEXT_LENGTH = 18;

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isDarkmode } = useTheme();
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
        className="w-full bg-[#e6e6e6] dark:bg-black"
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
      <View className="w-full h-[140px] items-center flex-1 flex-row justify-between mt-px p-2.5 self-center" key={data.index}>
        <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
          <Ionicons name={isNotePublished ? "arrow-undo" : "share"} size={30} color="green" />
        </TouchableOpacity>
        <View className="items-end absolute bottom-0 justify-center top-0 w-1/2 right-0 pr-[17px] bg-brand-gray">
          {isPrivate && (
            <TouchableOpacity
              className="justify-center items-center absolute right-5"
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
        <View className="py-[50px] items-center mb-[100px]">
          <ActivityIndicator size="small" className="text-foreground" />
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
    if (listData.length === 0) {
      return (
        <View className="justify-center items-center">
          <LottieView testID="no-results-animation" source={require("../../assets/animations/noResultFound.json")} autoPlay loop style={{ width: 100, height: 200 }} />
          <Text className="font-inter text-[15px] font-normal">No Results Found</Text>
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
    <View className="flex-1 bg-[#e4e4e4] dark:bg-black">
      <StatusBar translucent backgroundColor="transparent" />
      <View
        testID="HomeScreen"
        className="bg-accent"
        style={{ paddingTop: Constants.statusBarHeight - 20, height: width > 500 ? Dimensions.get("window").height * 0.12 : Dimensions.get("window").height * 0.19 }}
      >
        <View className="flex-row items-center justify-between px-[5px] mb-0 mt-2.5 bg-accent">
          <View className="flex-row items-center justify-between pb-[15px] pt-2.5 w-full">
            <View className="flex-row justify-between items-center" style={{ width: width > 500 ? "13%" : "27%" }}>
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
                showChildInTooltip={false}
                isVisible={accountTip && !userTutorial}
                content={
                  <TooltipContent message="See account information here." onPressOk={() => { setAccountTip(false); setSearchTip(true); }} onSkip={skipTutorial} />
                }
                placement="bottom"
              >
                <TouchableOpacity
                  testID="user-account"
                  className="rounded-full items-center justify-center bg-[#161A1D] ml-2"
                  style={{ width: width > 1000 ? 50 : 30, height: width > 1000 ? 50 : 30 }}
                  onPress={() => router.push("/account")}
                >
                  <Text className="font-inter font-semibold text-sm self-center text-[#F7F8F9]">{userInitials}</Text>
                </TouchableOpacity>
              </Tooltip>
              <Text className="font-inter text-lg font-medium">Notes</Text>
            </View>
            <View testID="greeting-component" className="mr-2.5">
              <Greeting />
              <Text testID="user-name" className="font-inter font-medium h-1/2 text-center self-center">{userName}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-2.5 mx-5">
          {!isSearchVisible && (
            <View className="flex-row justify-between" style={{ width: width > 500 ? "20%" : "45%" }}>
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
                showChildInTooltip={false}
                isVisible={pubPrivTip && !userTutorial}
                content={
                  <TooltipContent message="Switch between your published and privated notes with this switch" onPressOk={() => { setPubPrivTip(false); setTutorialDone("HomeScreen", true); }} onSkip={skipTutorial} />
                }
                placement="bottom"
              >
                <View className="bg-[#e7e7e7] h-[30px] w-[120px] rounded-lg mb-2.5 flex-row justify-evenly items-center">
                  <Pressable onPress={() => { setIsPrivate(false); setPublished(true); }}>
                    <View
                      testID="public-btn"
                      className="px-[5px] py-[3px] rounded-lg"
                      style={{ backgroundColor: isPrivate ? "transparent" : "black" }}
                    >
                      <Text
                        className="font-inter text-[10px] font-semibold"
                        style={{ color: isPrivate ? "black" : "white" }}
                      > Published</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => { setIsPrivate(true); setPublished(false); }}>
                    <View
                      testID="private-btn"
                      className="px-[5px] py-[3px] rounded-lg"
                      style={{ backgroundColor: isPrivate ? "black" : "transparent" }}
                    >
                      <Text
                        className="font-inter text-[10px] font-semibold"
                        style={{ color: isPrivate ? "white" : "black" }}
                      >Private</Text>
                    </View>
                  </Pressable>
                </View>
              </Tooltip>
              <View>
                {!isSortOpened ? (
                  <Tooltip
                    topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
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
          <View className="flex-row justify-between items-center" style={{ width: isSearchVisible ? "95%" : 40 }}>
            {isSearchVisible && (
              <Animated.View
                className="right-0 bottom-0 bg-[#f0f0f0] justify-center items-center h-9 rounded-xl overflow-hidden mb-[23px]"
                style={{ width: searchBarWidth }}
              >
                <TextInput testID="search-input" placeholder="Search..." value={searchQuery} placeholderTextColor="#999" onChangeText={setSearchQuery} className="font-inter flex-1 text-base text-black px-2.5 py-0 w-full" cursorColor="black" autoFocus />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <View className="mb-2.5 -mt-[25px]">
                <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                  <Ionicons name="close" size={25} />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-2.5">
                <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                  <Tooltip
                    topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
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

      <View testID="notes-list" className="flex-1 w-full">
        {rendering ? <NoteSkeleton /> : renderList()}
      </View>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />

      {isSortOpened && !isSearchVisible && (
        <View
          testID="sort-options"
          className="absolute top-[120px] right-5 w-[200px] rounded-md p-2.5 z-10 shadow-md bg-white dark:bg-[#525252]"
          style={{ elevation: 10 }}
        >
          <Text className="font-inter text-base font-semibold mb-2.5 text-black dark:text-[#c7c7c7]">Sort by</Text>
          <View className="h-1/2 justify-evenly items-center">
            {[
              { option: 1, label: "Date & Time(latest)" },
              { option: 2, label: "A-Z" },
              { option: 3, label: "Z-A" },
            ].map(({ option, label }) => (
              <TouchableOpacity key={option} onPress={() => { setSelectedSortOption(option); setIsSortOpened(false); }}>
                <View
                  className={`w-[200px] justify-center items-center p-2.5 rounded-[10px] ${selectedSortOption === option ? "bg-accent" : "bg-transparent"}`}
                >
                  <Text
                    className="font-inter text-sm py-1.5"
                    style={{ color: isDarkmode && selectedSortOption !== option ? "#ccc" : "#000" }}
                  >
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

export default HomeScreen;
