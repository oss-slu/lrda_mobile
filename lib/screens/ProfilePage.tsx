import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { User } from "../models/user_class";
import { Note, EditNoteScreenProps } from "../../types";
import { PhotoType, VideoType } from "../models/media_class";
import { ImageNote, ProfilePageProps } from "../../types";
import DataConversion from "../utils/data_conversion";
import ApiService from "../utils/api_calls";
import { useTheme } from "../components/ThemeProvider";

const user = User.getInstance();

export default function ProfilePage({ navigation }: ProfilePageProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [allImages, setAllImages] = useState<ImageNote[]>([]);
  const [count, setCount] = useState(0);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUser] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const name = await user.getName();
      setUser(name || "");
      if (name) {
        const initials = name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("");
        setUserInitials(initials);
      }
    })();
  }, []);

  const navigateToEditNoteScreen = (note: Note) => {
    const data = {
      note,
      onSave: (note: Note) => {
        console.log("Note saved:", note);
      },
    };

    navigation.navigate("EditNote", { note: data?.note, onSave: data?.onSave });
  };

  const fetchMessages = async () => {
    let response;
    try {
      const data = await ApiService.fetchMessages(
        false,
        false,
        (await user.getId()) || ""
      );
      setMessages(data);

      const fetchedNotes = DataConversion.convertMediaTypes(data);

      setNotes(fetchedNotes);
      setCount(fetchedNotes.length);

      const extractedImages = DataConversion.extractImages(fetchedNotes);

      setAllImages(extractedImages.reverse());
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  let role = "Administrator";
  let fieldNotes = count;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryColor,
    },
    text: {
      fontFamily: "HelveticaNeue",
      color: theme.text,
    },
    image: {
      flex: 1,
      height: undefined,
      width: undefined,
    },
    profileImage: {
      width: 200,
      height: 200,
      borderRadius: 100,
      overflow: "hidden",
    },
    add: {
      backgroundColor: theme.primaryColor,
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center", 
      justifyContent: "center",
    },
    userPhoto: {
      backgroundColor: theme.text,
      height: 190,
      width: 190,
      borderRadius: 200,
      alignContent: "center",
      justifyContent: "center",
    },
    infoContainer: {
      alignSelf: "center",
      alignItems: "center",
      marginTop: 16,
    },
    statsContainer: {
      flexDirection: "row",
      alignSelf: "center",
      marginTop: 32,
    },
    statsBox: {
      alignItems: "center",
      flex: 1,
    },
    subText: {
      fontSize: 12,
      color: theme.text,
      textTransform: "uppercase",
      fontWeight: "500",
    },
    preview: {
      width: 200,
      height: 200,
    },
    recent: {
      marginLeft: 78,
      marginTop: 32,
      marginBottom: 6,
      fontSize: 10,
    },
    recentItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    activityIndicator: {
      backgroundColor: theme.text,
      padding: 4,
      height: 12,
      width: 12,
      borderRadius: 6,
      marginTop: 3,
      marginRight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignSelf: "center" }}>
          <View style={styles.userPhoto}>
            <Text
              style={{ fontWeight: "500", fontSize: 60, alignSelf: "center", color: theme.primaryColor }}
            >
              {userInitials}
            </Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.text, { fontWeight: "200", fontSize: 36 }]}>
            {userName}
          </Text>
          <Text style={[styles.text, { color: "#AEB5BC", fontSize: 14 }]}>
            {role}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsBox}>
            <Text style={[styles.text, { fontSize: 24 }]}>{fieldNotes}</Text>
            <Text style={[styles.text, styles.subText]}>Posts</Text>
          </View>
          <View
            style={[
              styles.statsBox,
              {
                borderColor: "#DFD8C8",
                borderLeftWidth: 1,
                borderRightWidth: 1,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize: 24 }]}>
              {allImages.length}
            </Text>
            <Text style={[styles.text, styles.subText]}>Images</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={[styles.text, { fontSize: 24 }]}>{"< Year "}</Text>
            <Text style={[styles.text, styles.subText]}>Age</Text>
          </View>
        </View>

        <View style={{ marginTop: 32, width: "100%" }}>
          <FlatList
            data={allImages}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigateToEditNoteScreen(item?.note)}
                style={{ flex: 1, aspectRatio: 1 }}
              >
                <Image
                  style={{ flex: 1, aspectRatio: 1 }}
                  source={{ uri: item?.image }}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
