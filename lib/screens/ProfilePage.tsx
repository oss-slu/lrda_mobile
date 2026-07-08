import React, { useMemo } from "react";
import { Text, View, SafeAreaView, Image, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { Note } from "../../types";
import DataConversion from "../utils/data_conversion";
import { fetchAllNotes } from "../utils/api_calls";
import { queryKeys } from "../query/queryKeys";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfilePage() {
  const navigation = useRouter();
  const authUser = useAuthStore((s) => s.user);

  const userName = authUser?.name ?? "";
  const userInitials = useMemo(() => {
    if (!userName) return "N/A";
    return userName
      .split(" ")
      .map((part) => part[0])
      .join("");
  }, [userName]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.profile.notes(authUser?.id ?? ""),
    queryFn: () => fetchAllNotes({ creatorId: authUser?.id ?? "" }),
    enabled: !!authUser?.id,
    select: (notes) => {
      const converted = DataConversion.convertMediaTypes(notes);
      return {
        fieldNotes: converted.length,
        images: DataConversion.extractImages(converted).reverse(),
      };
    },
  });

  const fieldNotes = data?.fieldNotes ?? 0;
  const allImages = data?.images ?? [];

  const navigateToEditNoteScreen = (note: Note) => {
    navigation.push({ pathname: "/edit-note", params: { noteData: JSON.stringify(note) } });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
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
                <View className="h-[190px] w-[190px] content-center justify-center rounded-full bg-foreground">
                  <Text className="self-center text-[60px] font-medium text-primary">{userInitials}</Text>
                </View>
              </View>
              <View className="mt-4 items-center self-center">
                <Text className="font-inter text-4xl font-extralight text-foreground">{userName}</Text>
                <Text className="font-inter text-sm text-[#AEB5BC]">
                  {authUser?.role ? authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1) : (authUser?.email ?? "")}
                </Text>
              </View>
              <View className="mt-8 flex-row self-center">
                <View className="flex-1 items-center">
                  <Text className="font-inter text-2xl text-foreground">{fieldNotes}</Text>
                  <Text className="font-inter text-xs font-medium uppercase text-foreground">Posts</Text>
                </View>
                <View className="flex-1 items-center border-l border-r border-[#DFD8C8]">
                  <Text className="font-inter text-2xl text-foreground">{allImages.length}</Text>
                  <Text className="font-inter text-xs font-medium uppercase text-foreground">Images</Text>
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
      )}
    </SafeAreaView>
  );
}
