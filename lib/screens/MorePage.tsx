import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StyleSheet,
  Dimensions,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";
import { useDispatch } from "react-redux";
import { User } from "../models/user_class";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import ThemeToggle from "../components/ThemeToggle"; 

const { width } = Dimensions.get("window");
const data = [
  {source: require("../../assets/Pond_395.jpg")},
  {source: require("../../assets/Pond_048.jpg")},
  {source: require("../../assets/Pond_049.jpg")},
  {source: require("../../assets/Pond_062.jpg")},
  {source: require("../../assets/Pond_221.jpg")},
  {source: require("../../assets/Pond_290.jpg")},
  {source: require("../../assets/Pond_021.jpg")},
  {source: require("../../assets/Pond_883.jpg")},
];


export default function MorePage() {
  const { theme, isDarkmode, toggleDarkmode } = useTheme();
  const dispatch = useDispatch();
  //add navigation prop
  const navigation = useNavigation();
  

  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode();
    }
  };

  const onLogoutPress = async () => {
    try {
      await User.getInstance().logout(dispatch);
    } catch (e) {
      console.log(e);
    }
  };

  const MenuItem = ({ title, iconName, onPress }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuContent}>
        <Ionicons name={iconName} size={24} color={"black"} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkmode ? "#000" : theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: isDarkmode ? "#555" : "#ccc" }]}>
            <Text style={[styles.avatarText, { color: isDarkmode ? "#fff" : theme.text }]}>Ap</Text>
          </View>
          <Text style={[styles.username, { color: isDarkmode ? "#fff" : theme.text }]}>More</Text>
        </View>
        <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} />
        </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Carousel
          width={width} 
          height={width / 2}
          data={data}
          renderItem={({ item }) => (
            <Image source={item.source} style={styles.bannerImage} />
          )}
          autoPlay
          autoPlayInterval={3000}
          scrollAnimationDuration={800}
        />
      </View>


      {/* Menu Items */}
      <ScrollView contentContainerStyle={styles.menuContainer}
        scrollEnabled={false}
      >
        <MenuItem title="About" iconName="information-circle-outline" />
        <MenuItem title="Resource" iconName="link-outline" />
        <MenuItem title="Meet our team" iconName="people-outline" onPress={() => navigation.navigate("TeamPage")}/>
        <MenuItem title="Settings" iconName="settings-outline" />
        <MenuItem title="FAQ" iconName="help-circle-outline" />
        <MenuItem title="Logout" iconName="exit-outline" onPress={onLogoutPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
   },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  profile: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "bold" },
  username: { marginLeft: 12, fontSize: 20, fontWeight: "bold" },
  bannerImage: {
    width: "95%",
    height: "100%",
    resizeMode: "cover",
    alignSelf: "center",
    borderRadius: 10, // Rounded corners
  },  
  carouselContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  menuContainer: {
    marginTop: 200,
    padding: 16,
    alignItems: "center",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // White background for buttons
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    width: "90%",
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "black", // Black text for contrast
  },
  
});
