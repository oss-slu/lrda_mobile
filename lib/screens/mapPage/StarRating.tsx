import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  ratings: number;
  reviews: number;
}

const StarRating: React.FC<StarRatingProps> = ({ ratings, reviews }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const name = i > ratings ? "star-outline" : "star";
    stars.push(<Ionicons name={name} size={15} color="#FF8C00" key={i} />);
  }

  return (
    <View className="flex-row items-center">
      {stars}
      <Text className="text-xs ml-[5px] text-[#444]">({reviews})</Text>
    </View>
  );
};

export default StarRating;
