import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  Linking,
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { PhotoType, VideoType, AudioType } from "../models/media_class";
import { Note } from "../../types";
import { HomeScreenProps } from "../../types";
import ApiService from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";

const user = User.getInstance();

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [drawerAnimation] = useState(new Animated.Value(0));
  const [buttonAnimation] = useState(new Animated.Value(0));
  const [isPrivate, setIsPrivate] = useState(true);
  const [global, setGlobal] = useState(false);
  const [published, setPublished] = useState(false);
  const [reversed, setReversed] = useState(false);
  let textLength = 16;
  let userInitals = user
    .getName()
    ?.split(" ")
    .map((namePart) => namePart[0])
    .join("");

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const refreshPage = () => {
    setUpdateCounter(updateCounter+1)
  }

  useEffect(() => {
    if (isOpen) {
      Animated.timing(drawerAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const animatedStyles = {
    transform: [
      {
        translateX: drawerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 500],
        }),
      },
    ],
  };

  const buttonAnimatedStyles = {
    transform: [
      {
        rotate: buttonAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  useEffect(() => {
    if (route.params?.note) {
      setNotes([...notes, route.params.note]);
    }
    fetchMessages();
  }, [route.params, updateCounter]);

  const fetchMessages = async () => {
    try {
      const data = await ApiService.fetchMessages(global, published, user.getId() || "");
      setMessages(data);

      const fetchedNotes = DataConversion.convertMediaTypes(data); // returns sorted Notes with proper media types.

      if (Platform.OS === "web") {
        textLength = 50;
        setNotes(reversed ? fetchedNotes.reverse() : fetchedNotes);
      } else {
        setNotes(reversed ? fetchedNotes : fetchedNotes.reverse());
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes?.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
    refreshPage();
  };

  const deleteNoteFromAPI = async (id: string) => {
    try {
      const success = await ApiService.deleteNoteFromAPI(
        id,
        user.getId() || ""
      );
      if (success) {
        refreshPage();
        return true;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  };

  const handleGoWeb = () => {
    Linking.openURL(
      "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
    );
  };

  const handleLogout = () => {
    user.logout();
  };

  const handleToggleGlobal = () => {
    setGlobal(!global);
    refreshPage();
  };
  const handleTogglePublished = () => {
    setPublished(!published);
    refreshPage();
  };

  const handleReverseOrder = () => {
    setNotes(notes.reverse());
    setReversed(!reversed);
    setUpdateCounter(updateCounter + 1);
  };

  const deleteNote = (id: string) => {
    if (Platform.OS === "web") {
      async function name() {
        const success = await deleteNoteFromAPI(id);
        if (success) {
          setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        }
      }
      name();
    } else {
      Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              const success = await deleteNoteFromAPI(id);
              if (success) {
                setNotes((prevNotes) =>
                  prevNotes.filter((note) => note.id !== id)
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const renderItem = ({ item }: { item: Note }) => {
    const mediaItem = item.media[0];
    return (
      <TouchableOpacity
        style={styles.noteContainer}
        onPress={() =>
          navigation.navigate("EditNote", { note: item, onSave: updateNote })
        }
      >
        <View style={{ flexDirection: "row" }}>
          {mediaItem?.getType() === "image" ? (
            <Image
              style={styles.preview}
              source={{ uri: mediaItem.getUri() }}
            />
          ) : mediaItem?.getType() === "video" ? (
            <Image
              style={styles.preview}
              source={{ uri: (mediaItem as VideoType).getThumbnail() }}
            />
          ) : (
            <Image
              source={require("../components/public/noPreview.png")}
              style={styles.preview}
            />
          )}
          <View
            style={{ alignSelf: "center", position: "absolute", left: 120 }}
          >
            <Text style={styles.noteTitle}>
              {item.title.length > textLength
                ? item.title.slice(0, textLength) + "..."
                : item.title}
            </Text>

            <Text style={styles.noteText}>
              {`${item.time.split(", ")[0]}\n${item.time.split(", ")[1]}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: 10,
          }}
          onPress={() => deleteNote(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#111111" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleDrawer}
        style={[styles.overlay, { display: !isOpen ? "flex" : "none" }]}
      />
      <Animated.View style={[styles.drawer, animatedStyles]}>
        <Animated.View style={[buttonAnimatedStyles]}>
          <TouchableOpacity style={styles.backButton} onPress={toggleDrawer}>
            <Ionicons
              name={isOpen ? "chevron-back-outline" : "chevron-forward-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name={"person-outline"} size={30} color="black" />
          <Text style={styles.mediumText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name={"people-outline"} size={30} color="black" />
          <Text style={styles.mediumText}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={handleGoWeb}>
          <Ionicons name={"laptop-outline"} size={30} color="black" />
          <Text style={styles.mediumText}>Our Website</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name={"settings-outline"} size={30} color="black" />
          <Text style={styles.mediumText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem}>
          <Ionicons name={"bug-outline"} size={30} color="black" />
          <Text style={styles.mediumText}>Report a Bug</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name={"log-out-outline"} size={30} color="white" />
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.topView}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.userPhoto}>
            <Text
              style={{ fontWeight: "600", fontSize: 20, alignSelf: "center" }}
            >
              {userInitals}
            </Text>
          </View>
          <Text style={styles.title}>Field Notes</Text>
        </View>
        <TouchableOpacity onPress={toggleDrawer} style={[styles.menuButton]}>
          <Ionicons name="menu-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.filtersContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TouchableOpacity
        onPress={() => setIsPrivate(!isPrivate)}
        style={isPrivate ? styles.filtersSelected : styles.filters}>
          <Text style={styles.selectedFont}>Private ({notes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTogglePublished}
          style={published ? styles.filtersSelected : styles.filters}
        >
          <Text style={published ? styles.selectedFont : styles.filterFont}>
            Published {published ? `(${notes.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleToggleGlobal}
          style={global ? styles.filtersSelected : styles.filters}
        >
          <Text style={global ? styles.selectedFont : styles.filterFont}>
            Global {global ? `(${notes.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReverseOrder} style={styles.filters}>
          <Text style={styles.filterFont}>Sort by Time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filters}>
          <Text style={styles.filterFont}>St. Louis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filters}>
          <Text style={styles.filterFont}>Alphabetical</Text>
        </TouchableOpacity>
      </ScrollView>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet!</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddNote", { refreshPage })}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },
  overlay: {
    position: "absolute",
    width: "150%",
    height: "150%",
    flex: 1,
    zIndex: 80,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    paddingTop: "30%",
    height: "110%",
    width: 200,
    position: "absolute",
    backgroundColor: "white",
    zIndex: 99,
    right: 0,
  },
  drawerItem: {
    paddingLeft: 10,
    paddingTop: 10,
    flexDirection: "row",
  },
  logout: {
    flexDirection: "row",
    position: "absolute",
    bottom: "10%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginLeft: "10%",
    width: "80%",
    borderRadius: 20,
  },
  logoutText: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
    color: "white",
  },
  backButton: {
    margin: "7%",
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  userPhoto: {
    backgroundColor: "#F4DFCD",
    height: 50,
    width: 50,
    borderRadius: 50,
    alignContent: "center",
    justifyContent: "center",
  },
  mediumText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
    flexShrink: 1,
  },
  noteBox: {
    width: "100%",
    flexDirection: "column",
    flexWrap: "wrap",
  },
  noteText: {
    fontSize: 18,
  },
  noteTextBox: {
    width: "60%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 22,
    fontSize: 28,
    color: "#bbb",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  topView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  menuButton: {
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  noteContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    width: "95%",
    padding: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  filtersContainer: {
    minHeight: 30,
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 5,
    maxHeight: 30,
    marginBottom: 17,
    zIndex: 10,
  },
  filters: {
    justifyContent: "center",
    borderColor: "#F4DFCD",
    borderWidth: 2,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  filtersSelected: {
    justifyContent: "center",
    backgroundColor: "#C7EBB3",
    fontSize: 22,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  selectedFont: {
    fontSize: 17,
    color: "#111111",
    fontWeight: "700",
  },
  filterFont: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    lineHeight: 80,
    color: "#111111",
    marginLeft: 5,
    marginBottom: "-1%",
  },
  pfp: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginLeft: 3,
    marginTop: 3,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: "10%",
    alignContent: "center",
    alignSelf: "center",
  },
});

export default HomeScreen;
