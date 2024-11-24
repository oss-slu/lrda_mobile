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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";
import { useDispatch } from "react-redux";
import { User } from "../models/user_class";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

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
        <Switch
          value={isDarkmode}
          onValueChange={handleToggleDarkMode}
          thumbColor={isDarkmode ? "#fff" : "#ccc"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>

      {/* Banner Image */}
      <Image
        source={{ uri: "https://via.placeholder.com/300x150" }} // Replace with actual image URL
        style={styles.bannerImage}
      />

      {/* Menu Items */}
      <ScrollView contentContainerStyle={styles.menuContainer}>
        <MenuItem title="About" iconName="information-circle-outline" />
        <MenuItem title="Resource" iconName="link-outline" />
        <MenuItem title="Meet our team" iconName="people-outline" onPress={() => navigation.navigate("MeetOurTeam")}/>
        <MenuItem title="Settings" iconName="settings-outline" />
        <MenuItem title="FAQ" iconName="help-circle-outline" />
        <MenuItem title="Logout" iconName="exit-outline" onPress={onLogoutPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: 20,
  },
  menuContainer: {
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
