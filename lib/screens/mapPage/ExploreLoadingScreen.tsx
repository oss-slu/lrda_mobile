import { ActivityIndicator, View, Text } from "react-native";

const ExploreLoadingScreen = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#0000ff" />
      <View className="p-[5px]" />
      <Text className="font-inter text-foreground">Loading your location...</Text>
    </View>
  );
};

export default ExploreLoadingScreen;
