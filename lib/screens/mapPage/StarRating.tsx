import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StarRatingProps {
  ratings: number;
  reviews: number;
}

const StarRating: React.FC<StarRatingProps> = ({ ratings, reviews }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const name = i > ratings ? "star-outline" : "star";
    stars.push(<Ionicons name={name} size={15} style={styles.star} key={i} />);
  }

  return (
    <View style={styles.container}>
      {stars}
      <Text style={styles.text}>({reviews})</Text>
    </View>
  );
};

export default StarRating;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    color: "#FF8C00",
  },
  text: {
    fontSize: 12,
    marginLeft: 5,
    color: "#444",
  },
});
