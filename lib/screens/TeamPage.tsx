import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, StatusBar, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const WR_team = [
  {
    id: 1,
    name: "Rachel Lindsey",
    role: "Director of Center on Lived Religion",
    image: require("../../assets/Rachel.jpg"),
  },
  {
    id: 2,
    name: "Adam Park",
    role: "Associate Director of Research (COLR)",
    image: require("../../assets/Adam.jpg"),
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Patric Cuba",
    role: "IT Architect",
    image: require("../../assets/Patrick.jpg"),
  },
  {
    id: 2,
    name: "Bryan Haberberger",
    role: "Full Stack Developer",
    image: require("../../assets/Bryan.jpg"),
  },
  {
    id: 3,
    name: "Yash Bhatia",
    role: "Software Developer (COLR)",
    image: require("../../assets/Yash.jpg"),
  },
  {
    id: 4,
    name: "Stuart Ray",
    role: "Developer",
    image: require("../../assets/Stuart.jpg"),
  },
  {
    id: 5,
    name: "Izak Robles",
    role: "Developer",
    image: require("../../assets/Izak.jpg"),
  },

  {
    id: 6,
    name: "Karthik Mangineni",
    role: "Tech Lead",
    image: require("../../assets/karthikMangineni.jpg"),
  },
  {
    id: 7,
    name: "Adem Durakovic",
    role: "Developer",
    image: require("../../assets/Adem.jpg"),
  },
  {
    id: 8,
    name: "Amar Hadzic",
    role: "Developer",
    image: require("../../assets/Amar.png"),
  },
  {
    id: 9,
    name: "Zanxiang Wang",
    role: "Tech Lead",
    image: require("../../assets/Zanxiang.jpg"),
  },
  {
    id: 10,
    name: "Amy Chen",
    role: "Developer",
    image: require("../../assets/Amy.jpg"),
  },
  {
    id: 11,
    name: "Justin Wang",
    role: "Developer",
    image: require("../../assets/Justin.jpg"),
  },
  {
    id: 12,
    name: "Sam Sheppard",
    role: "Developer",
    image: require("../../assets/Sam.jpg"),
  },
  {
    id: 13,
    name: "Josh Hogan",
    role: "Developer",
    image: require("../../assets/F-22.jpg"),
  },
];

export default function TeamPage() {
  const router = useRouter();

  const renderItem = ({ item }: { item: { id: number; name: string; role: string; image: any } }) => (
    <View className="items-center flex-1 mx-2">
      <Image source={item.image} className="w-20 h-20 rounded-full mb-2" accessible accessibilityLabel={`${item.name}, ${item.role}`} />
      <Text className="font-inter text-foreground text-sm font-bold text-center">{item.name}</Text>
      <Text className="font-inter text-tertiary text-xs text-center">{item.role}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary">
      <StatusBar translucent backgroundColor="transparent" />

      <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
        <View
          className="flex-row justify-start items-center px-5"
          style={{ marginTop: width > 500 ? "5%" : "20%" }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name={"arrow-left"} size={30} />
          </TouchableOpacity>
          <View className="ml-5">
            <Text className="font-inter text-[17px] font-bold">Team</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="py-5 items-center">
          <Text className="font-inter text-foreground text-2xl font-bold text-center">About Our Team</Text>
        </View>

        <View className="px-4 mb-6">
          <Text className="font-inter text-tertiary text-base text-center mb-3">
            The Saint Louis University Where's Religion Team
          </Text>
          <FlatList
            data={WR_team}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 20 }}
          />
        </View>

        <View className="px-4 mb-6">
          <Text className="font-inter text-tertiary text-base text-center mb-3">The Development Team</Text>
          <FlatList
            data={teamMembers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 20 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
