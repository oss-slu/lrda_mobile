import React, { useState, useEffect, useRef } from "react";
import { Alert, Platform, Linking, View, Image, Text, StyleSheet, FlatList,
   ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import { User } from "../utils/user_class";

interface Note {
  images: any;
  id: string;
  title: string;
  text: string;
  time: string;
}
const user = User.getInstance();

export type HomeScreenProps = {
  navigation: any;
  route: { params?: { note: Note; onSave: (note: Note) => void } };
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [drawerAnimation] = useState(new Animated.Value(0));
  const [buttonAnimation] = useState(new Animated.Value(0));
  const [global,setGlobal] = useState(false);

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
  }, [route.params, updateCounter]);

  const fetchMessages = async () => {
    let response;
    try {
      if(global){
        response = await fetch(
          "http://lived-religion-dev.rerum.io/deer-lr/query",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "message"
            }),
          }
        );
      } else {
        response = await fetch(
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
      }

      const data = await response.json();
      setMessages(data);

      const fetchedNotes: Note[] = data.map((message: any) => {
        const time = message.__rerum.isOverwritten
          ? new Date(message.__rerum.isOverwritten)
          : new Date(message.__rerum.createdAt);
        time.setHours(time.getHours() - 5);
        return {
          id: message["@id"],
          title: message.title || "",
          text: message.BodyText || "",
          images: message.items || [],
          time:
            time.toLocaleString("en-US", { timeZone: "America/Chicago" }) || "",
          creator: message.creator || "",
        };
      });

      fetchedNotes.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      );
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const addNote = (note: Note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
    setUpdateCounter(updateCounter + 1);
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
    setUpdateCounter(updateCounter + 1);
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

  const handleToggleGlobal = () => {
    setUpdateCounter(updateCounter+1);
    setGlobal(!global);
  }

  const deleteNote = (id: string) => {
    if (Platform.OS === 'web'){
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
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {
              const success = await deleteNoteFromAPI(id);
              if (success) {
                setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
              }
            }
          }
        ],
        { cancelable: false }
      );
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
        <View style={{flexDirection: 'row'}}>
        {
            item.images.length >= 1 ?
              <Image style={styles.preview} source={{ uri: item.images[0] }}/>
              :
              <Image source={require("../components/public/noPreview.png")} style={styles.preview} ></Image>
          }
            <View style={{alignSelf: 'center'}}> 
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteText}>
                {`${item.time.split(', ')[0]}\n${item.time.split(', ')[1]}`}
              </Text>
            </View>
        </View>
          
            <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={() => deleteNote(item.id)}>
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
      <View style={styles.topView} >
        <View style={{ flexDirection: "row", alignItems: "center" }} >
          <Image
            style={[styles.pfp, { borderRadius: 50 }]}
            source={require("../components/public/nopfp.png")}
          />
          <Text style={styles.mediumText}>Hi, {user.getName()}</Text>
        </View>

        <TouchableOpacity onPress={toggleDrawer} style={[styles.menuButton]}>
          <Ionicons name="menu-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Field Notes</Text>
      <ScrollView
        style={styles.filtersContainer}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TouchableOpacity style={styles.filtersSelected}>
          <Text style={styles.selectedFont}>All ({notes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleGlobal} style={global ? styles.filtersSelected : styles.filters}>
          <Text style={global ? styles.selectedFont : styles.filterFont}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filters}>
          <Text style={styles.filterFont}>Most Recent</Text>
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
  },
  noteBox: {
    width: "100%",
    flexDirection: 'row',
  },
  noteText: {
    fontSize: 18,
 
  },
  noteTextBox: {
    width: '60%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    width: '95%',
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
    fontSize: 60,
    fontWeight: "bold",
    lineHeight: 80,
    color: "#111111",
    marginLeft: 5,
    marginBottom: '-1%',
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
    marginRight: '10%',
    alignContent: 'center',
    alignSelf: 'center',
  },
});

export default HomeScreen;
