import React, { useState, useEffect, useRef } from "react";
import { Linking, View, Image, Text, StyleSheet, FlatList, 
  ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import { User } from "../utils/user_class";

interface Note {
  id: string;
  title: string;
  text: string;
}
const user = User.getInstance();
// console.log("User id: ", user.getId());

export type HomeScreenProps = {
  navigation: any;
  route: { params?: { note: Note; onSave: (note: Note) => void } };
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [drawerAnimation] = useState(new Animated.Value(0));
  const [buttonAnimation] = useState(new Animated.Value(0));

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

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
  }, [route.params]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        "http://lived-religion-dev.rerum.io/deer-lr/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "message",
            creator: user.getId(),
          }),
        }
      );

      const data = await response.json();
      setMessages(data);
      // Map fetched messages to notes
      const fetchedNotes: Note[] = data.map((message: any) => ({
        id: message["@id"],
        title: message.title || "",
        text: message.BodyText || "", // Fallback to an empty string if 'text' is not available in the fetched message
      }));
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const addNote = (note: Note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
  };

  const deleteNoteFromAPI = async (id: string) => {
    try {
      const url = `http://lived-religion-dev.rerum.io/deer-lr/delete`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: new Headers({
          "Content-Type": "text/plain; charset=utf-8",
        }),
        body: JSON.stringify({
          type: "message",
          creator: user.getId(),
          "@id": id,
        }),
      });
      console.log(response);

      if (response.status === 204) {
        return true;
      } else {
        console.log(response);
        throw response;
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
    navigation.navigate("Login");
  };

  const deleteNote = async (id: string) => {
    const success = await deleteNoteFromAPI(id);
    if (success) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const renderItem = ({ item }: { item: Note }) => {
    return (
      <TouchableOpacity
        style={styles.noteContainer}
        onPress={() =>
          navigation.navigate("EditNote", { note: item, onSave: updateNote })
        }
      >
        <Text style={styles.noteText}>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#111111" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDrawer}
        style={[styles.overlay, { display: !isOpen ? "flex" : "none" }]}/>
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
      <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={24} color="white" />
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          style={styles.pfp}
          source={require("../components/public/nopfp.png")}
        />
        <Text style={styles.mediumText}>Hi, {user.getName()}</Text>
      </View>

      <Text style={styles.title}>Field{"\n"}Notes</Text>
      <ScrollView
        style={styles.filtersContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View style={styles.filtersSelected}>
          <Text style={styles.selectedFont}>All ({notes.length})</Text>
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterFont}>Nearest</Text>
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterFont}>St. Louis</Text>
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterFont}>Alphabetical</Text>
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterFont}>Most Recent</Text>
        </View>
      </ScrollView>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet!</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddNote", { onSave: addNote })}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent black color
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
  mediumText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
  },
  noteText: {
    flex: 1,
    fontSize: 18,
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
  menuButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#111111",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  noteContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: 355,
    padding: 20,
    paddingHorizontal: 35,
    flexDirection: "row",
  },
  filtersContainer: {
    minHeight: 30,
    alignSelf: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
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
    fontSize: 72,
    fontWeight: "bold",
    lineHeight: 80,
    color: "#111111",
    marginBottom: 10,
  },
  pfp: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginLeft: 3,
    marginTop: 3,
  },
});

export default HomeScreen;
