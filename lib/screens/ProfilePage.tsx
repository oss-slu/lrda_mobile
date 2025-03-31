import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { User } from "../models/user_class";
import { Note, ImageNote, ProfilePageProps } from "../../types";
import DataConversion from "../utils/data_conversion";
import ApiService from "../utils/api_calls";
import { useTheme } from "../components/ThemeProvider";
import Feather from 'react-native-vector-icons/Feather';
import { defaultTextFont } from "../../styles/globalStyles";

const user = User.getInstance();

export default function ProfilePage({ navigation }: ProfilePageProps) {
  const [allImages, setAllImages] = useState<ImageNote[]>([]);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUserName] = useState("");
  const [fieldNotes, setFieldNotes] = useState(0);
  const { theme } = useTheme(); // Access theme dynamically

  useEffect(() => {
    (async () => {
      const name = await user.getName();
      setUserName(name || "");
      if (name) {
        const initials = name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("");
        setUserInitials(initials);
      }
    })();

    const fetchMessages = async () => {
      try {
        const data = await ApiService.fetchMessages(
          false,
          false,
          (await user.getId()) || ""
        );
        const fetchedNotes = DataConversion.convertMediaTypes(data);
        setFieldNotes(fetchedNotes.length);

        const extractedImages = DataConversion.extractImages(fetchedNotes);
        setAllImages(extractedImages.reverse());
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const navigateToEditNoteScreen = (note: Note) => {
    navigation.navigate("EditNote", { note });
  };

  const styles = createStyles(theme); // Pass theme to the style generator

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allImages}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather name={'arrow-left'} size={30} style={{marginLeft: 20}}/>
            </TouchableOpacity>
            <View style={{ alignSelf: "center" }}>
              <View style={styles.userPhoto}>
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: 60,
                    alignSelf: "center",
                    color: theme.primaryColor,
                  }}
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
                Administrator
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statsBox}>
                <Text style={[styles.text, { fontSize: 24 }]}>
                  {fieldNotes}
                </Text>
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
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ flex: 1, aspectRatio: 1 }}
            onPress={() => navigateToEditNoteScreen(item.note)}
          >
            <Image
              source={{ uri: item.image }}
              style={{ flex: 1, aspectRatio: 1 }}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// Generate styles dynamically based on theme
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryColor,
    },
    text: {
      ...defaultTextFont,
      color: theme.text,
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
      ...defaultTextFont,
      fontSize: 12,
      color: theme.text,
      textTransform: "uppercase",
      fontWeight: "500",
    },
  });
