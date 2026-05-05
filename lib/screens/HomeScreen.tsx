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
import { useUpdateNote } from "../hooks/mutations/useUpdateNote";
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

  const updateNoteMutation = useUpdateNote();

  const { notes, rendering, hasMore, isLoadingMore, handleLoadMore } = useNotesList({
    creatorId: authUser?.id || undefined,
    published: published ? true : authUser?.id ? false : undefined,
  });

  const { isSearchVisible, searchQuery, setSearchQuery, toggleSearchBar, searchBarWidth } = useAnimatedSearch();

  useEffect(() => {
    const navigateToAddNote = () => {
      const untitledNumber = findNextUntitledNumber(notes);
      router.push({ pathname: "/add-note", params: { untitledNumber: String(untitledNumber) } });
    };
    setNavigateToAddNote(() => navigateToAddNote);
  }, [router, notes, setNavigateToAddNote]);

  const handleArchiveNote = async (note: Note | undefined) => {
    if (note?.id) {
      try {
        await updateNoteMutation.mutateAsync({ ...note, isPublished: false });
        ToastMessage.show({ type: "success", text1: "Success", text2: "Note successfully archived." });
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

  const deleteNote = async (id: string, rowMap: any) => {
    if (rowMap[id]) rowMap[id].closeRow();
    const noteToDelete = notes.find((note) => note.id === id);
    if (noteToDelete) {
      await handleArchiveNote(noteToDelete);
    }
  };

  const publishNote = async (id: string, rowMap: any) => {
    if (rowMap[id]) rowMap[id].closeRow();
    const found = notes.find((note) => note.id === id);
    if (!found) return;
    try {
      await updateNoteMutation.mutateAsync({ ...found, isPublished: !found.isPublished });
    } catch (error) {
      console.error("Error publishing note:", error);
      ToastMessage.show({ type: "error", text1: "Error", text2: "Failed to update note. Try again later." });
    }
  };

  const displayNotes = sortNotes(filterNotes(notes, searchQuery), selectedSortOption);
  const privateData = displayNotes.filter((n) => !n.isPublished);
  const publicData = displayNotes.filter((n) => n.isPublished);
  const listData = isPrivate ? privateData : publicData;

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
      <View className="mt-px h-[140px] w-full flex-1 flex-row items-center justify-between self-center p-2.5" key={data.index}>
        <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
          <Ionicons name={isNotePublished ? "arrow-undo" : "share"} size={30} color="green" />
        </TouchableOpacity>
        <View className="absolute bottom-0 right-0 top-0 w-1/2 items-end justify-center bg-brand-gray pr-[17px]">
          {isPrivate && (
            <TouchableOpacity className="absolute right-5 items-center justify-center" onPress={() => deleteNote(data.item.id, rowMap)}>
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
        <View className="mb-[100px] items-center py-[50px]">
          <ActivityIndicator size="small" className="text-foreground" />
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          testID="load-more"
          onPress={handleLoadMore}
          className="my-1 w-[65%] items-center self-center rounded-lg bg-accent py-5"
        >
          <Text testID="load-more-button" className="font-inter text-base font-normal text-foreground">
            Load More
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <View className="items-center p-5">
        <Text testID="empty-state-text" className="font-inter text-sm text-gray-500">
          End of the Page
        </Text>
      </View>
    );
  };

  const renderList = () => {
    if (listData.length === 0) {
      return (
        <View className="items-center justify-center">
          <LottieView
            testID="no-results-animation"
            source={require("../../assets/animations/noResultFound.json")}
            autoPlay
            loop
            style={{ width: 100, height: 200 }}
          />
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
        style={{
          paddingTop: Constants.statusBarHeight - 20,
          height: width > 500 ? Dimensions.get("window").height * 0.12 : Dimensions.get("window").height * 0.19,
        }}
      >
        <View className="mb-0 mt-2.5 flex-row items-center justify-between bg-accent px-[5px]">
          <View className="w-full flex-row items-center justify-between pb-[15px] pt-2.5">
            <View className="flex-row items-center gap-2">
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
                showChildInTooltip={false}
                isVisible={accountTip && !userTutorial}
                content={
                  <TooltipContent
                    message="See account information here."
                    onPressOk={() => {
                      setAccountTip(false);
                      setSearchTip(true);
                    }}
                    onSkip={skipTutorial}
                  />
                }
                placement="bottom"
              >
                <TouchableOpacity
                  testID="user-account"
                  className="ml-2 items-center justify-center rounded-full bg-[#161A1D]"
                  style={{ width: width > 1000 ? 50 : 30, height: width > 1000 ? 50 : 30 }}
                  onPress={() => router.push("/account")}
                >
                  <Text className="self-center font-inter text-sm font-semibold text-[#F7F8F9]">{userInitials}</Text>
                </TouchableOpacity>
              </Tooltip>
              <Text className="font-inter text-lg font-medium">Notes</Text>
            </View>
            <View testID="greeting-component" className="mr-2.5">
              <Greeting />
              <Text testID="user-name" className="h-1/2 self-center text-center font-inter font-medium">
                {userName}
              </Text>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-2.5 flex-row items-center justify-between">
          {!isSearchVisible && (
            <View className="flex-row justify-between" style={{ width: width > 500 ? "20%" : "45%" }}>
              <Tooltip
                topAdjustment={Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0}
                showChildInTooltip={false}
                isVisible={pubPrivTip && !userTutorial}
                content={
                  <TooltipContent
                    message="Switch between your published and privated notes with this switch"
                    onPressOk={() => {
                      setPubPrivTip(false);
                      setTutorialDone("HomeScreen", true);
                    }}
                    onSkip={skipTutorial}
                  />
                }
                placement="bottom"
              >
                <View className="mb-2.5 h-[30px] w-[120px] flex-row items-center justify-evenly rounded-lg bg-[#e7e7e7]">
                  <Pressable
                    onPress={() => {
                      setIsPrivate(false);
                      setPublished(true);
                    }}
                  >
                    <View
                      testID="public-btn"
                      className="rounded-lg px-[5px] py-[3px]"
                      style={{ backgroundColor: isPrivate ? "transparent" : "black" }}
                    >
                      <Text className="font-inter text-[10px] font-semibold" style={{ color: isPrivate ? "black" : "white" }}>
                        {" "}
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
                      className="rounded-lg px-[5px] py-[3px]"
                      style={{ backgroundColor: isPrivate ? "black" : "transparent" }}
                    >
                      <Text className="font-inter text-[10px] font-semibold" style={{ color: isPrivate ? "white" : "black" }}>
                        Private
                      </Text>
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
                      <TooltipContent
                        message="Filter your notes with this!"
                        onPressOk={() => {
                          setFilterToolTip(false);
                          setPubPrivTip(true);
                        }}
                        onSkip={skipTutorial}
                      />
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
          <View className="flex-row items-center justify-between" style={{ width: isSearchVisible ? "95%" : 40 }}>
            {isSearchVisible && (
              <Animated.View
                className="bottom-0 right-0 mb-[23px] h-9 items-center justify-center overflow-hidden rounded-xl bg-[#f0f0f0]"
                style={{ width: searchBarWidth }}
              >
                <TextInput
                  testID="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={setSearchQuery}
                  className="w-full flex-1 px-2.5 py-0 font-inter text-base text-black"
                  cursorColor="black"
                  autoFocus
                />
              </Animated.View>
            )}
            {isSearchVisible ? (
              <View className="-mt-[25px] mb-2.5">
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
                      <TooltipContent
                        message="Try out our search bar!"
                        onPressOk={() => {
                          setSearchTip(false);
                          setFilterToolTip(true);
                        }}
                        onSkip={skipTutorial}
                      />
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

      <View testID="notes-list" className="w-full flex-1">
        {rendering ? <NoteSkeleton /> : renderList()}
      </View>

      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />

      {isSortOpened && !isSearchVisible && (
        <View
          testID="sort-options"
          className="absolute right-5 top-[120px] z-10 w-[200px] rounded-md bg-white p-2.5 shadow-md dark:bg-[#525252]"
          style={{ elevation: 10 }}
        >
          <Text className="mb-2.5 font-inter text-base font-semibold text-black dark:text-[#c7c7c7]">Sort by</Text>
          <View className="h-1/2 items-center justify-evenly">
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
                  className={`w-[200px] items-center justify-center rounded-[10px] p-2.5 ${selectedSortOption === option ? "bg-accent" : "bg-transparent"}`}
                >
                  <Text
                    className="py-1.5 font-inter text-sm"
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
