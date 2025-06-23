import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from "../components/ThemeProvider";
import { defaultTextFont } from "../../styles/globalStyles";

const { width, height } = Dimensions.get('window');

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
    id:13, 
    name: "Josh Hogan",
    role: "Developer",
    image: require("../../assets/F-22.jpg")
  }
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
      <Text style={[styles.memberName, { color: theme.text || "#ffffff" }]}>{item.name}</Text>
      <Text style={[styles.memberRole, { color: theme.secondaryText || "#aaaaaa" }]}>{item.role}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name={'arrow-left'} size={30} />
          </TouchableOpacity>
          <View style={styles.headerHeading}>
            <Text style={{ ...defaultTextFont, fontSize: 17, fontWeight: 'bold' }}>Team</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Body */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text || "#ffffff" }]}>About Our Team</Text>
        </View>

        {/* WR Team Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.subtitle, { color: theme.secondaryText || "#aaaaaa", marginBottom: 12 }]}>
            The Saint Louis University Where's Religion Team
          </Text>
          <FlatList
            data={WR_team}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.teamContainer}
            columnWrapperStyle={styles.teamRow}
          />
        </View>

        {/* Development Team Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.subtitle, { color: theme.secondaryText || "#aaaaaa", marginBottom: 12 }]}>
            The Development Team
          </Text>
          <FlatList
            data={teamMembers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={[styles.teamContainer, { paddingBottom: 40 }]}
            columnWrapperStyle={styles.teamRow}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 60,
  },
  header: {
    height: width > 500 ? height * 0.12 : height * 0.19,
  },
  headerContent: {
    marginTop: width > 500 ? '5%' : '20%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerHeading: {
    marginLeft: 20,
  },
  headerTitle: {
    ...defaultTextFont,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  titleContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    ...defaultTextFont,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    ...defaultTextFont,
    fontSize: 16,
    textAlign: "center",
  },
  teamContainer: {
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
    ...defaultTextFont,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  memberRole: {
    ...defaultTextFont,
    fontSize: 12,
    textAlign: "center",
  },
});
