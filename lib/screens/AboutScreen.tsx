import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <StatusBar translucent backgroundColor="transparent" />

      <View className="bg-accent" style={{ height: width > 500 ? height * 0.12 : height * 0.19 }}>
        <View className="flex-row items-center justify-start px-5" style={{ marginTop: width > 500 ? "5%" : "20%" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name={"arrow-left"} size={30} />
          </TouchableOpacity>
          <View className="ml-5">
            <Text className="text-[17px] font-bold">About</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-5 text-center text-2xl font-bold text-foreground">About Where's Religion?</Text>
        <Text className="mb-4 text-justify text-base leading-6 text-foreground">
          Where's Religion? is an open-source application developed by humanities faculty and IT professionals at Saint Louis University
          that supports in-person research, remote data entry, media sharing, and mapping. The app is designed to facilitate a more robust
          public understanding of religion through rigorous scholarly methods. Our conviction is that the study of religion must account for
          the wide range of embodied experiences, improvised practices, material cultures, and shared spaces that humans inhabit. Through a
          research methodology that moves beyond analysis of sacred texts, creeds, and official teachings, Where's Religion? provides a
          platform to diversify the data we study and to advance the study of religion we all encounter in everyday life.
        </Text>
        <Text className="mb-4 text-justify text-base leading-6 text-foreground">
          Where's Religion? is a keystone outcome of the Center on Lived Religion at Saint Louis University. We have received external
          support from the Henry Luce Foundation ($400,000 in 2018 and $470,000 in 2022), and internal support from the College of Arts &
          Sciences, the Office for the Vice President for Research and the Research Computing Group, Open Source with SLU, the Walter J.
          Ong, S.J., Center for Digital Humanities, and the CREST Research Center (Culture, Religion, Ethics, Science, Technology).
        </Text>
      </ScrollView>
    </View>
  );
}
