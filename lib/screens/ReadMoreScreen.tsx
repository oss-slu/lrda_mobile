import React from "react";
import { View, Text, Dimensions, TouchableOpacity, ActivityIndicator, StatusBar } from "react-native";
import WebView from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { height } = Dimensions.get("window");

function ReadMoreScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <StatusBar translucent backgroundColor="transparent" />

      <View className="bg-accent" style={{ height: height * 0.15 }}>
        <View className="flex-row items-center justify-start px-5" style={{ marginTop: "20%" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name={"arrow-left"} size={30} />
          </TouchableOpacity>
          <View className="ml-5">
            <Text className="font-inter text-[17px] font-bold">Resource</Text>
          </View>
        </View>
      </View>

      <WebView
        source={{ uri: "https://www.slu.edu" }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={true}
        allowsInlineMediaPlayback={false}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
      ></WebView>
    </View>
  );
}

export default ReadMoreScreen;
