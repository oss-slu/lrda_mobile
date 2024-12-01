import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";

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
    role: "Software Engineer",
    image: require("../../assets/Yash.jpg"),
  },
  {
    id: 4,
    name: "Izak Robles",
    role: "Developer",
    image: require("../../assets/Izak.jpg"),
  },
  {
    id: 5,
    name: "Stuart Ray",
    role: "Developer",
    image: require("../../assets/Stuart.jpg"),
  },
  {
    id: 6,
    name: "Amar Hadzic",
    role: "Developer",
    image: require("../../assets/stock_person.jpg"),
  },
  {
    id: 7,
    name: "Adem Durakovic",
    role: "Developer",
    image: require("../../assets/stock_person.jpg"),
  },
  {
    id: 8,
    name: "Nikhil Muthukumar",
    role: "Developer",
    image: require("../../assets/stock_person.jpg"),
  },
];

export default function TeamPage({ navigation }) {
  const { theme } = useTheme();

  const renderItem = ({ item }) => (
    <View style={styles.teamMember}>
      <Image
        source={item.image}
        style={styles.teamImage}
        accessible
        accessibilityLabel={`${item.name}, ${item.role}`}
      />
      <Text style={[styles.memberName, { color: theme.text || "#ffffff" }]}>
        {item.name}
      </Text>
      <Text
        style={[
          styles.memberRole,
          { color: theme.secondaryText || "#aaaaaa" },
        ]}
      >
        {item.role}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.text || "#ffffff"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text || "#ffffff" }]}>
          Team
        </Text>
      </View>

      {/* About Our Team */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.text || "#ffffff" }]}>
          About Our Team
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.secondaryText || "#aaaaaa" },
          ]}
        >
          The Development Team
        </Text>
      </View>

      {/* Team Members Grid */}
      <FlatList
        data={teamMembers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.teamContainer}
        columnWrapperStyle={styles.teamRow}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  titleContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  teamContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  teamRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  teamMember: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  memberRole: {
    fontSize: 12,
    textAlign: "center",
  },
});
