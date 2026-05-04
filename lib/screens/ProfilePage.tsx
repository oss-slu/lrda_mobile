import React, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, Image, FlatList, TouchableOpacity } from "react-native";
import { useAuthStore } from "../stores/authStore";
import { Note, ImageNote } from "../../types";
import DataConversion from "../utils/data_conversion";
import { fetchAllNotes } from "../utils/api_calls";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfilePage() {
  const navigation = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [allImages, setAllImages] = useState<ImageNote[]>([]);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUserName] = useState("");
  const [fieldNotes, setFieldNotes] = useState(0);

  useEffect(() => {
    const name = authUser?.name;
    if (name) {
      setUserName(name);
      const initials = name
        .split(" ")
        .map((namePart) => namePart[0])
        .join("");
      setUserInitials(initials);
    }

    const fetchMessages = async () => {
      try {
        const data = await fetchAllNotes({ creatorId: authUser?.id || "" });
        const fetchedNotes = DataConversion.convertMediaTypes(data);
        setFieldNotes(fetchedNotes.length);

        const extractedImages = DataConversion.extractImages(fetchedNotes);
        setAllImages(extractedImages.reverse());
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [authUser]);

  const navigateToEditNoteScreen = (note: Note) => {
    navigation.push({ pathname: "/edit-note", params: { noteData: JSON.stringify(note) } });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <FlatList
        data={allImages}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 200 }}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity onPress={() => navigation.back()}>
              <Feather name={"arrow-left"} size={30} style={{ marginLeft: 20 }} />
            </TouchableOpacity>
            <View className="self-center">
              <View className="bg-foreground h-[190px] w-[190px] rounded-full content-center justify-center">
                <Text className="font-medium text-[60px] self-center text-primary">
                  {userInitials}
                </Text>
              </View>
            </View>
            <View className="self-center items-center mt-4">
              <Text className="font-inter text-foreground font-extralight text-4xl">{userName}</Text>
              <Text className="font-inter text-[#AEB5BC] text-sm">Administrator</Text>
            </View>
            <View className="flex-row self-center mt-8">
              <View className="items-center flex-1">
                <Text className="font-inter text-foreground text-2xl">{fieldNotes}</Text>
                <Text className="font-inter text-foreground text-xs uppercase font-medium">Posts</Text>
              </View>
              <View
                className="items-center flex-1 border-[#DFD8C8] border-l border-r"
              >
                <Text className="font-inter text-foreground text-2xl">{allImages.length}</Text>
                <Text className="font-inter text-foreground text-xs uppercase font-medium">Images</Text>
              </View>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ flex: 1, aspectRatio: 1 }} onPress={() => navigateToEditNoteScreen(item.note)}>
            <Image source={{ uri: item.image }} style={{ flex: 1, aspectRatio: 1 }} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
