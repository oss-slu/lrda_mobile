import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { User } from "../utils/user_class";

interface Note {
  images: any;
  id: string;
  title: string;
  text: string;
  time: string;
}

const user = User.getInstance();

export default function ProfilePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [count, setCount] = useState(0);

  const fetchMessages = async () => {
    let response;
    try {
      {
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

      setCount(fetchedNotes.length);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  let role = "Administrator";
  let fieldNotes = count;
  if (user.getRoles()) {
    role = "Student";
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignSelf: "center" }}>
          <View style={styles.profileImage}>
            <Image
              source={require("../../assets/profile-pic.jpg")}
              style={styles.image}
              resizeMode="center"
            ></Image>
          </View>
          <TouchableOpacity style={styles.add}>
            <Ionicons
              name="ios-add"
              size={48}
              color="#DFD8C8"
              style={{ marginTop: 6, marginLeft: 2 }}
            ></Ionicons>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.text, { fontWeight: "200", fontSize: 36 }]}>
            {user.getName()}
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
            <Text style={[styles.text, { fontSize: 24 }]}>45,844</Text>
            <Text style={[styles.text, styles.subText]}>Followers</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={[styles.text, { fontSize: 24 }]}>302</Text>
            <Text style={[styles.text, styles.subText]}>Following</Text>
          </View>
        </View>

        <View style={{ marginTop: 32 }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {notes?.map((item: Note) => {
              const textLength = 20;
              return (
                <TouchableOpacity
                  key={item.id}
                  //   style={styles.noteContainer}
                  //   onPress={() =>
                  //     navigation.navigate("EditNote", { note: item, onSave: updateNote })
                  //   }
                >
                  <View style={{ flexDirection: "row" }}>
                    {item.images.length >= 1 ? (
                      <Image
                        style={styles.preview}
                        source={{ uri: item.images[0] }}
                      />
                    ) : (
                      <Image
                        source={require("../components/public/noPreview.png")}
                        style={styles.preview}
                      ></Image>
                    )}
                    <View
                      style={{
                        alignSelf: "center",
                        position: "absolute",
                        left: 120,
                      }}
                    >
                      <Text style={styles.noteTitle}>
                        {item.title.length > textLength
                          ? item.title.slice(0, textLength) + "..."
                          : item.title}
                      </Text>
                      <Text style={styles.noteText}>
                        {`${item.time.split(", ")[0]}\n${
                          item.time.split(", ")[1]
                        }`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <Text style={[styles.subText, styles.recent]}>Recent Activity</Text>
        <View style={{ alignItems: "center" }}>
          <View style={styles.recentItem}>
            <View style={styles.activityIndicator}></View>
            <View style={{ width: 250 }}>
              <Text
                style={[styles.text, { color: "#41444B", fontWeight: "300" }]}
              >
                Started following{" "}
                <Text style={{ fontWeight: "400" }}>Jake Challeahe</Text> and{" "}
                <Text style={{ fontWeight: "400" }}>Luis Poteer</Text>
              </Text>
            </View>
          </View>

          <View style={styles.recentItem}>
            <View style={styles.activityIndicator}></View>
            <View style={{ width: 250 }}>
              <Text
                style={[styles.text, { color: "#41444B", fontWeight: "300" }]}
              >
                Started following{" "}
                <Text style={{ fontWeight: "400" }}>Luke Harper</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  text: {
    fontFamily: "HelveticaNeue",
    color: "#52575D",
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginHorizontal: 16,
  },
  subText: {
    fontSize: 12,
    color: "#AEB5BC",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
  },
  dm: {
    backgroundColor: "#41444B",
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: "#34FFB9",
    position: "absolute",
    bottom: 28,
    left: 10,
    padding: 4,
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  add: {
    backgroundColor: "#41444B",
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
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
  mediaImageContainer: {
    width: 180,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  mediaCount: {
    backgroundColor: "#41444B",
    position: "absolute",
    top: "50%",
    marginTop: -50,
    marginLeft: 30,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    shadowColor: "rgba(0, 0, 0, 0.38)",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    shadowOpacity: 1,
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
    backgroundColor: "#CABFAB",
    padding: 4,
    height: 12,
    width: 12,
    borderRadius: 6,
    marginTop: 3,
    marginRight: 20,
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
  preview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: "10%",
    alignContent: "center",
    alignSelf: "center",
  },
  noteText: {
    fontSize: 18,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "600",
    maxWidth: "100%",
    flexShrink: 1,
  },
});
