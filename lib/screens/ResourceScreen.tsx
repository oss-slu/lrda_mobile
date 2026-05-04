import React from "react";
import { View, Text, TouchableOpacity, Dimensions, FlatList, Linking, StatusBar, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { onlineResources, analogueResources } from "../data";

import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

function ResourceScreen() {
  const router = useRouter();

  const renderOnlineResource = ({ item }: { item: { title: string; url: string } }) => (
    <TouchableOpacity className="mb-3 bg-white rounded-sm p-3 shadow-sm">
      <Text className="text-[#1a73e8] text-sm" onPress={() => Linking.openURL(item.url)}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderAnalogueResource = ({ item }: { item: string }) => (
    <View className="mb-3 bg-white rounded-sm p-3 shadow-sm">
      <Text className="text-sm text-black">{item}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <StatusBar translucent backgroundColor="transparent" />

      <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
        <View
          className="flex-row items-center px-5"
          style={{ marginTop: width > 500 ? "5%" : "20%" }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={30} />
          </TouchableOpacity>
          <View className="ml-5">
            <Text className="text-[17px] font-bold">Resources</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        <Text className="text-lg font-bold my-4">Online Resources</Text>
        <FlatList data={onlineResources} renderItem={renderOnlineResource} keyExtractor={(item) => item.url} scrollEnabled={false} />

        <Text className="text-lg font-bold my-4">Analogue Resources</Text>
        <FlatList
          data={analogueResources}
          renderItem={renderAnalogueResource}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

export default ResourceScreen;
