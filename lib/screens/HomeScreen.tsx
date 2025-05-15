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
  Keyboard,
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
import NotesComponent from "../components/NotesComponent";
import Greeting from "../components/Greeting";
import { useAddNoteContext } from "../context/AddNoteContext";
import LottieView from 'lottie-react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { green } from "react-native-reanimated/lib/typescript/Colors";
import { toogleAddNoteState } from "../../redux/slice/AddNoteStateSlice";
import { useSelector, useDispatch } from 'react-redux'
import { defaultTextFont } from "../../styles/globalStyles";
import Tooltip from 'react-native-walkthrough-tooltip';
import TooltipContent from "../onboarding/TooltipComponent";

const { width, height } = Dimensions.get("window");
const user = User.getInstance();
const limit = 20;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isPrivate, setIsPrivate] = useState(true);
  const [published, setPublished] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [rendering, setRendering] = useState(true);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUserName] = useState('');
  const [initialItems, setInitialItems] = useState([
    { label: "My Entries", value: "my_entries" },
    { label: "Published Entries", value: "published_entries" },
  ]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialItems[0].value);
  const [items, setItems] = useState(initialItems);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(
    undefined
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const { setNavigateToAddNote } = useAddNoteContext();
  const { theme, isDarkmode } = useTheme();
  const animation = useRef(new Animated.Value(0)).current; // Animation value
  const [isSortOpened, setIsSortOpened] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(1);
  let textLength = 18;
  const dispatch = useDispatch();
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const navigateToAddNote = () => {
      const untitledNumber = findNextUntitledNumber(notes);
      console.log("in homescreen untitled numbe ", untitledNumber);
      navigation.navigate("AddNote", { untitledNumber, refreshPage });
  
    }
    setNavigateToAddNote(() => navigateToAddNote)
  }, [navigation, notes])


  useEffect(() => {
    (async () => {
      const name = await user.getName();
      if (name) {
        const firstName = name.split(" ")[0];
        setUserName(firstName);
  
        const initials = name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("");
        setUserInitials(initials);
      }
    })();
  }, []);
  
const refreshPage = () => {
    setPage(1);
    setHasMore(true);
    setUpdateCounter((prev) => prev + 1);
  };


  // Fetch notes, either all published or user-specific based on filter
  useEffect(() => {
    setRendering(true);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [updateCounter, published]);


  const fetchMessages = async (pageNum: number) => {
    try {
        if (pageNum === 1) {
            setRendering(true); 
        } else {
            setIsLoadingMore(true); 
        }

        const skip = (pageNum - 1) * limit;
        const userId = await user.getId();

        const data = await ApiService.fetchMessagesBatch(
            false,
            published,
            userId,
            limit,
            skip
        );

        const filteredNotes = data.filter((note: Note) => !note.isArchived);

        const convertedNotes = DataConversion.convertMediaTypes(filteredNotes)
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        const finalNotes = reversed ? convertedNotes.reverse() : convertedNotes;

        if (pageNum === 1) {
            setNotes(finalNotes);
        } else {
            setNotes(prev => [...prev, ...finalNotes]);
        }

        setHasMore(finalNotes.length === limit);

    } catch (error) {
        console.error("Error fetching notes:", error);
        ToastMessage.show({
            type: "error",
            text1: "Error fetching notes",
            text2: error.message,
        });
    } finally {
        setRendering(false);      
        setIsLoadingMore(false);  
    }
};

  

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes?.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
    refreshPage();
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

  const handleArchiveNote = async (note: Note | undefined, user: User) => {
    if (note?.id) {
      try {
        const userId = await user.getId();
        const updatedNote = {
          ...note,
          isArchived: true,
          published: false,
          archivedAt: new Date().toISOString(),
        };

        const response = await ApiService.overwriteNote(updatedNote);
        if (response.ok) {
          ToastMessage.show({
            type: "success",
            text1: "Success",
            text2: "Note successfully archived.",
          });
          updateNote(updatedNote); // Update the note in local state
          return true;
        } else {
          throw new Error("Archiving failed");
        }
      } catch (error) {
        ToastMessage.show({
          type: "error",
          text1: "Error",
          text2: "Failed to archive note. System failure. Try again later.",
        });
        console.error("Error archiving note:", error);
        return false;
      }
    } else {
      ToastMessage.show({
        type: "error",
        text1: "Error",
        text2: "You must first save your note before archiving it.",
      });
      return false;
    }
  };

  const findNextUntitledNumber = (notes: Note[]): number => {
    return notes.reduce((maxNumber, note) => {
        const match = note.title.match(/^Untitled (\d+)$/);
        if (match) {
            const number = parseInt(match[1], 10);
            return Math.max(maxNumber, number);
        }
        return maxNumber;
    }, 0) + 1;
};


  const sideMenu = (data: any, rowMap: any) => {
    const note = data.item;
    const isNotePublished = note.published;

    return (
      <View style={styles(theme, width).rowBack} key={data.index}>
        <TouchableOpacity>
          <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
          <Ionicons
          name={isNotePublished ? "arrow-undo" : "share"}
          size={30}
          color={"green"}
        />
          </TouchableOpacity>
        </TouchableOpacity>
        <View
          style={[
            styles(theme, width).backRightBtn,
            styles(theme, width).backRightBtnRight,
          ]}
        >
          {isPrivate ? (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: 20,
              }}
              onPress={() => deleteNote(data.item.id, rowMap)}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={styles(theme, width).backColor.color}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };
 //handle sort
 const handleSort = () => {
  setIsSortOpened(!isSortOpened);
}

const handleSortOption = ({ option }) => {
  setSelectedSortOption(option);
  setIsSortOpened(false);
}

  const deleteNote = (id: string, rowMap: any) => {
    if (rowMap[id]) {
      rowMap[id].closeRow();
    }

    const noteToDelete = notes.find((note) => note.id === id);

    if (noteToDelete) {
      handleArchiveNote(noteToDelete, user); // Pass the correct arguments
    }

    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };


  async function publishNote(data: any, rowMap: any) {
    if (rowMap[data]) {
      rowMap[data].closeRow();

    }
    const foundNote = notes.find((note) => note.id === data);
    const editedNote: Note = {
      id: foundNote?.id || "",
      title: foundNote?.title || "",
      text: foundNote?.text || "",
      creator: foundNote?.creator || "",
      media: foundNote?.media || [],
      latitude: foundNote?.latitude || "",
      longitude: foundNote?.longitude || "",
      audio: foundNote?.audio || [],
      published: !foundNote?.published || false,
      time: foundNote?.time || new Date(),
      tags: foundNote?.tags || [],
    };
    await ApiService.overwriteNote(editedNote);
    refreshPage();
  }

  const renderList = (notes: Note[]) => {
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

      // Apply sorting based on selectedSortOption
    filteredNotes.sort((a, b) => {
      if (selectedSortOption === 1) {
        // Sort by date and time (latest first)
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      } else if (selectedSortOption === 2) {
        // Sort A-Z by title
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else if (selectedSortOption === 3) {
        // Sort Z-A by title
        return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
      }
      return 0;
    });
    const privateData = filteredNotes.filter((eachNotes) => eachNotes.published === false);
    const publicData = filteredNotes.filter((eachNotes) => eachNotes.published != false);
    return isPrivate ? (
      privateData.length > 0 ? (<SwipeListView
        data={privateData}
        renderItem={renderItem}
        renderHiddenItem={sideMenu}
        leftActivationValue={160}
        rightActivationValue={-160}
        leftOpenValue={75}
        rightOpenValue={-75}
        stopLeftSwipe={175}
        stopRightSwipe={-175}
        keyExtractor={(item) => item.id}
        onRightAction={(data, rowMap) => deleteNote(data, rowMap)}
        onLeftAction={(data, rowMap) => publishNote(data, rowMap)}
        contentContainerStyle={{paddingBottom: 150}}
        ListFooterComponent={renderFooter}
      />)
        : (<View style={styles(theme, width).resultNotFound}>

          <LottieView
            testID="no-results-animation"
            source={require('../../assets/animations/noResultFound.json')}
            autoPlay
            loop
            style={styles(theme, width).lottie}
          />
          <Text style={styles(theme, width).resultNotFoundTxt}>No Results Found</Text>
        </View>
        )

    ) : (
      publicData.length > 0 ? (
        <SwipeListView
          data={publicData}
          renderItem={renderItem}
          renderHiddenItem={sideMenu}
          leftActivationValue={160}
          leftOpenValue={75}
          stopLeftSwipe={175}
          keyExtractor={(item) => item.id}
          onLeftAction={(data, rowMap) => publishNote(data, rowMap)}
          contentContainerStyle={{ paddingBottom: 150 }}
          ListFooterComponent={renderFooter}
      />) :
        (<View style={styles(theme, width).resultNotFound}>

          <LottieView
            testID="no-results-animation"
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
    // Ensure ImageURI is a valid string
    let ImageURI = "";
    let IsImage = false;

    if (ImageType === "image") {
      ImageURI = mediaItem.getUri();
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.getThumbnail();
      IsImage = true;
    }

    // Enforce `uri` as a string, especially for Android
    const resolvedImageURI = Platform.OS === "android" ? String(ImageURI || "") : ImageURI;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={{
          backgroundColor: isDarkmode? 'black' : '#e6e6e6',
          width: "100%",
        }}
        onPress={() => {
          if (!item.published) {
            dispatch(toogleAddNoteState());
            navigation.navigate("EditNote", {
              note: {
                ...item,
                time: item.time.toISOString(), // Convert Date to ISO string
              },
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
        <NotesComponent IsImage={IsImage} resolvedImageURI={resolvedImageURI} ImageType={ImageType} textLength={textLength} showTime={showTime} item={item} isDarkmode={isDarkmode}/>
      </TouchableOpacity>
    );
  };


  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSearchBar = () => {
    if (isSearchVisible) {
      // Hide the search container
      setSearchQuery('');
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      // Show the search container
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



  const formatDate = (date: Date) => {
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

  const [userTutorial, setUserTutorial] = useState<boolean | null>(null);
  const [accountTip, setAccountTip] = useState<boolean>(false); // Start false, renamed from setAccontTip
  const [filterToolTip, setFilterToolTip] = useState<boolean>(false);
  const [searchTip, setSearchTip] = useState<boolean>(false);
  const [pubPrivTip, setPubPrivTip] = useState<boolean>(false);

  // useEffect to update the userTutorial state after the async call resolves.
  useEffect(() => {
    User.getHasDoneTutorial("HomeScreen").then((tutorialDone: boolean) => {
      setUserTutorial(tutorialDone);
      if (!tutorialDone) {
        setAccountTip(true); // Enable the account tip only if the tutorial hasn't been done
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor : isDarkmode? 'black' : '#e4e4e4'}}>
      <StatusBar translucent backgroundColor="transparent" />
      <View testID="HomeScreen" style={styles(theme, width).container}>
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

              <Tooltip
                topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                showChildInTooltip = {false}
                isVisible={accountTip && !userTutorial}
                content={
                <TooltipContent
                      message="See account information here."
                      onPressOk={() => {
                        setAccountTip(false);
                        setSearchTip(true);
                    }}
                    onSkip={() => {
                      // Disable all tutorial tips when Skip is pressed
                      setAccountTip(false);
                      setSearchTip(false);
                      setFilterToolTip(false);
                      setPubPrivTip(false);
                      User.setUserTutorialDone("HomeScreen", true)
                    }}
                  />
              }
              placement="bottom"
      >
              <TouchableOpacity testID="user-account"
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
            </Tooltip>
              <Text style={styles(theme, width).pageTitle}>Notes</Text>
            </View>

            <View testID="greeting-component" style={styles(theme, width).userWishContainer}>
              <Greeting />
              <Text testID="user-name" style={styles(theme, width).userName}>{userName}</Text>
            </View>
          </View>


        </View>

        <View style={[styles(theme, width).toolContainer, { marginHorizontal: 20, }]}>
          {
            !isSearchVisible && (
            <View style={styles(theme, width).publishedAndSortContainer}>
                     <Tooltip
              topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
              showChildInTooltip = {false}
              isVisible={pubPrivTip && !userTutorial}
              content={
              <TooltipContent
                message="Switch between your published and privated notes with this switch"
                  onPressOk={() => {
                    setPubPrivTip(false);
                    User.setUserTutorialDone("HomeScreen", true)
                }}
                onSkip={() => {
                  // Disable all tutorial tips when Skip is pressed
                  setAccountTip(false);
                  setSearchTip(false);
                  setFilterToolTip(false);
                  setPubPrivTip(false);
                  User.setUserTutorialDone("HomeScreen", true)
                }}
            />
          }
          placement="bottom"
          >
              <View style={styles(theme, width).publishedOrPrivateContainer}>
                <Pressable onPress={() => {
                  setIsPrivate(false);
                  setPublished(true);
                }}>
                  <View testID="public-btn" style={[styles(theme, width).publishedTxtContainer, { backgroundColor: isPrivate ? 'transparent' : 'black' },]}>
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? 'black' : 'white' }]}> Published</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => {
                  setIsPrivate(true);
                  setPublished(false);
                }}>
                  <View testID="private-btn" style={[styles(theme, width).publishedTxtContainer, { backgroundColor: isPrivate ? 'black' : 'transparent' }]}>
                    <Text style={[styles(theme, width).publishedTxt, { color: isPrivate ? 'white' : 'black' }]}>Private</Text>
                  </View>
                </Pressable>
              </View>
              </Tooltip>
              <View>
                {
                  !isSortOpened ? (            
                  <Tooltip
                    topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                    isVisible={filterToolTip && !userTutorial}
                    content={
                    <TooltipContent
                      message="Filter your notes with this!"
                        onPressOk={() => {
                          setFilterToolTip(false);
                          setPubPrivTip(true);
                      }}
                      onSkip={() => {
                        // Disable all tutorial tips when Skip is pressed
                        setAccountTip(false);
                        setSearchTip(false);
                        setFilterToolTip(false);
                        setPubPrivTip(false);
                        User.setUserTutorialDone("HomeScreen", true)
                      }}
                  />
                }
                placement="bottom"
                >
                <TouchableOpacity testID="sort-button"
                    onPress={handleSort}
                  >
      
                    <MaterialIcons name='sort' size={30} />
                  </TouchableOpacity>
                  </Tooltip>)
                    : (
                      <TouchableOpacity
                        onPress={handleSort}
                      >
                        <MaterialIcons name='close' size={30} />
                      </TouchableOpacity>)
                }
              </View>
            </View>
            )
          }
          <View style={[styles(theme, width).searchParentContainer, { width: isSearchVisible ? '95%' : 40 }]}>

            {/* Search Container */}
            {isSearchVisible && (
              <Animated.View
                style={[
                  styles(theme, width).searchContainer,
                  {
                    width: searchBarWidth,
                  },
                  {
                    marginBottom: 23,
                  }
                ]}
              >
                <TextInput
                  testID="search-input"
                  placeholder="Search..."
                  value={searchQuery}
                  placeholderTextColor="#999"
                  onChangeText={(e) => setSearchQuery(e)}
                  style={[styles(theme, width).searchInput]}
                  cursorColor='black'
                  autoFocus={true}
                />
              </Animated.View>
            )}
            {
              isSearchVisible ? (
                <View style={[styles(theme, width).searchIcon, {marginTop: -25}]}>
                  <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                    <Ionicons name='close' size={25} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles(theme, width).searchIcon}>
                  <TouchableOpacity testID="searchButton" onPress={toggleSearchBar}>
                  <Tooltip
                      topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                      isVisible={searchTip && !userTutorial}
                      content={
                      <TooltipContent
                        message="Try out our search bar!"
                          onPressOk={() => {
                            setSearchTip(false);
                            setFilterToolTip(true);
                        }}
                        onSkip={() => {
                          // Disable all tutorial tips when Skip is pressed
                          setAccountTip(false);
                          setSearchTip(false);
                          setFilterToolTip(false);
                          setPubPrivTip(false);
                          User.setUserTutorialDone("HomeScreen", true)
                        }}
                    />
                  }
                  placement="bottom"
                  >
                    <Ionicons name='search' size={25} />
                  </Tooltip>
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


      <NoteDetailModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        note={selectedNote}
      />

{isSortOpened && isSearchVisible== false && <View testID="sort-options" style={{
         position: 'absolute',
         top: 120, // adjust based on your layout
         right: 20,
         width: 200,
         backgroundColor: isDarkmode ? '#525252' : 'white',
         borderRadius: 12,
         padding: 10,
         zIndex: 10,
         elevation: 10,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.2,
         shadowRadius: 4,
      }}>
        <Text style={{  ...defaultTextFont, fontSize: 16, fontWeight: '600', marginBottom: 10, color: isDarkmode ? '#c7c7c7' : 'black',}}>Sort by</Text>
        <View style={{ height: '50%', justifyContent: 'space-evenly', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => handleSortOption({ option: 1 })}
          >
            <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 1 ? theme.homeColor : 'none', width: 200 }]}>
              <Text style={{ ...defaultTextFont, fontSize: 14, paddingVertical: 6, color: selectedSortOption === 1 ? theme.primary : (isDarkmode ? '#ccc' : '#000'), }}>Date & Time(latest)</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortOption({ option: 2 })}
          >
            <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 2 ? theme.homeColor : 'none' }]}>
              <Text style={{ ...defaultTextFont, fontSize: 14, paddingVertical: 6, color: selectedSortOption === 2 ? theme.primary : (isDarkmode ? '#ccc' : '#000'),}}>A-Z</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSortOption({ option: 3 })}
          >
            <View style={[styles(theme, width).selectedSortOption, { backgroundColor: selectedSortOption === 3 ? theme.homeColor : 'none' }]}>
              <Text style={{ ...defaultTextFont, fontSize: 14, paddingVertical: 6, color: selectedSortOption === 2 ? theme.primary : (isDarkmode ? '#ccc' : '#000'),}}>Z-A</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>}
    </View>
  );
};

const styles = (theme, width, color, isDarkmode) =>
  StyleSheet.create({
    container: {
      paddingTop: Constants.statusBarHeight - 20,
      backgroundColor: theme.homeColor,
      height: width > 500 ? height * 0.12 : height * 0.19,
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
      width: '100%',
    },
    addButton: {
      position: "absolute",
      bottom: 5,
      right: 20,
      marginTop: 20,
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
      color: theme.text
    },
    backRightBtnRight: {
      backgroundColor: theme.homeGray,
      width: "50%",
      right: 0,
      color: theme.text
    },
    userWishContainer: {
      marginRight: 10, 
    },
    userName: {
      ...defaultTextFont,
      fontWeight: '500',
      height: "50%",
      textAlign: 'center',       
      alignSelf: 'center',       
    },
    
    toolContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    publishedOrPrivateContainer: {
      backgroundColor: '#e7e7e7',
      height: 30,
      width: 120,
      borderRadius: 20,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    publishedAndSortContainer:{
      flexDirection: 'row', 
      width: width > 500? "20%" : "45%",
      justifyContent: 'space-between', 
    },
    publishedTxtContainer: {
      paddingHorizontal: 5,
      paddingVertical: 3,
      borderRadius: 20,
    },
    publishedTxt: {
      ...defaultTextFont,
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    searchContainer: {
      right: 0,
      bottom: 0,
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      height: 36,
      borderRadius: 25,
      overflow: "hidden", // Ensures the reveal is smooth
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    userAccountAndPageTitle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: width> 500? '13%' : "27%",

    },
    pageTitle: {
      ...defaultTextFont,
      fontSize: 18,
      fontWeight: '500'

    },
    lottie: {
      width: 100,
      height: 200,
    },
    resultNotFound: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    resultNotFoundTxt: {
      ...defaultTextFont,
      fontSize: 15,
      fontWeight: '400',
    },
    selectedSortOption: {
      // backgroundColor: theme.homeColor,
      width: width * 0.4,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      borderRadius: 10,
    }

  });

export default HomeScreen;






