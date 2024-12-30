import React, { useState, useEffect } from "react";
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
  StatusBar

} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../components/ThemeProvider";
import { useDispatch } from "react-redux";
import { User } from "../models/user_class";
import { useNavigation } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import ThemeToggle from "../components/ThemeToggle";
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import AppThemeSelectorScreen from "./AppThemeSelectorScreen";
import Entypo from 'react-native-vector-icons/Entypo';
import { clearThemeReducer } from "../../redux/slice/ThemeSlice";


const { width, height } = Dimensions.get("window");
const data = [
  { source: require("../../assets/Pond_395.jpg") },
  { source: require("../../assets/Pond_048.jpg") },
  { source: require("../../assets/Pond_049.jpg") },
  { source: require("../../assets/Pond_062.jpg") },
  { source: require("../../assets/Pond_221.jpg") },
  { source: require("../../assets/Pond_290.jpg") },
  { source: require("../../assets/Pond_021.jpg") },
  { source: require("../../assets/Pond_883.jpg") },
];


export default function MorePage() {
  const { theme, isDarkmode, toggleDarkmode } = useTheme();
  const dispatch = useDispatch();
  const userObject = User.getInstance();
  //add navigation prop
  const navigation = useNavigation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState("N/A");


  useEffect(() => {
    (async () => {
      const name = await userObject.getName();
      setUserName(name);
      if (name) {
        const initials = name
          .split(" ")
          .map((namePart) => namePart[0])
          .join("");
        setUserInitials(initials);
      }
    })();
  }, []);

  console.log(userObject?.userData?.name[0])
  const handleThemeOpen = () => {
    setIsThemeOpen(!isThemeOpen);
  }

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  }

  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode();
    }
  };

  const onLogoutPress = async () => {
    try {
      await User.getInstance().logout(dispatch);
      dispatch(clearThemeReducer())
    } catch (e) {
      console.log(e);
    }
  };


  const SettingOptions = ({ optionName, icon }) => (
    <View style={{
      height: 60,
      width: width * 0.8,
      backgroundColor: '#e5e8e5',
      shadowColor: "#000", // Shadow color
      shadowOffset: { width: 0, height: 4 }, // Shadow offset for depth
      shadowOpacity: 0.1, // Subtle shadow opacity
      shadowRadius: 6, // Blur for the shadow
      marginTop: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderRadius: 10,

    }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: icon === 'delete' ? 'red' : 'black' }}>{optionName}</Text>
      {
        icon === 'none' ? (
          <View style={{ height: 25, width: 25, backgroundColor: theme.homeColor, borderRadius: 50, borderWidth: 0.5 }}>
          </View>) :
          (<MaterialIcons name={icon} size={25} color={icon === 'delete' ? 'red' : 'black'} />)
      }
    </View>
  )
  const MenuItem = ({ title, iconName, onPress }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuContent}>
        <Text style={[styles.menuText, { fontSize: 14, fontWeight: '500' }]}>{title}</Text>
        <Ionicons name={iconName} size={styles.menuIcon.fontSize} color={"black"} />
      </View>
    </TouchableOpacity>
  );


  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />

      {
        !isSettingsOpen ? (<>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
            <View style={styles.headerContent}>
              <View style={styles.userAccountAndPageTitle}>
                <TouchableOpacity
                  style={[
                    styles.userPhoto,
                    { backgroundColor: theme.black },
                  ]}
                  onPress={() => {
                    navigation.navigate("AccountPage");
                  }}
                >
                  <Text style={styles.pfpText}>{userInitials}</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>More</Text>
              </View>
              <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} />
            </View>
          </View>

          <ScrollView

            contentContainerStyle={[styles.menuContainer, { paddingBottom: 200, }]}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
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
            <View style={{ marginTop: 40, }}>
              <MenuItem title="About" iconName="information-circle-outline" />
              <MenuItem title="Resource" iconName="link-outline" onPress={() => navigation.navigate("Resource")} />
              <MenuItem title="Meet our team" iconName="people-outline" onPress={() => navigation.navigate("TeamPage")} />
              <MenuItem title="Settings" iconName="settings-outline" onPress={handleSettingsToggle} />
              <MenuItem title="FAQ" iconName="help-circle-outline" />
              <MenuItem title="Logout" iconName="exit-outline" onPress={onLogoutPress} />
            </View>


          </ScrollView>
        </>) : (<>
          {/** header content starts here */}
          <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
            <View style={styles.settingsHeaderContent}>
              <TouchableOpacity onPress={handleSettingsToggle}>
                <Feather name={'arrow-left'} size={30} />
              </TouchableOpacity>
              <View style={styles.headerHeading}>
                <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Settings</Text>
              </View>
            </View>
          </View>
          {/** header content ends here */}
          <ScrollView>
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>



              <TouchableOpacity
                onPress={handleThemeOpen}
              >
                <SettingOptions optionName={'App Theme'} icon={'none'} />
              </TouchableOpacity>
              <TouchableOpacity>
                <SettingOptions optionName={'Delete My Account'} icon={'delete'} />
              </TouchableOpacity><TouchableOpacity>
                <SettingOptions optionName={'Report an Issue'} icon={'report'} />
              </TouchableOpacity><TouchableOpacity>
                <SettingOptions optionName={'Contact Us'} icon={'connect-without-contact'} />
              </TouchableOpacity>

            </View>

          </ScrollView>

          <Modal
            isVisible={isThemeOpen}
            backdropColor="#00aa00"
            backdropOpacity={0}
            style={{ margin: 0, justifyContent: 'center', alignItems: 'center', top: "20%" }} // Center the modal
          >
            <View
              style={{
                backgroundColor: 'white',
                padding: 20,
                borderRadius: 10,
                height: height * 0.7, // Restrict modal height to 70% of the screen
                width: '90%', // Set the width to 90% of the screen
              }}
            >
              <View style={styles.headingAndAction}>

                <Text style={styles.heading}>Customize your app</Text>

                <TouchableOpacity
                  onPress={handleThemeOpen}
                >
                  <Entypo name={'cross'} size={30} />
                </TouchableOpacity>
              </View>
              <AppThemeSelectorScreen />
            </View>
          </Modal>






        </>)
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    height: height * 0.15
  },
  profile: { flexDirection: "row", alignItems: "center" },
  userAccountAndPageTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '26%',

  },
  userPhoto: {
    height: width * 0.095,
    width: width * 0.095,
    borderRadius: 50,
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: 'black',
    marginLeft: 8,
  },
  pfpText: {
    fontWeight: "600",
    fontSize: 14,
    alignSelf: "center",
    color: 'white',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '500'

  },
  bannerImage: {
    width: "95%",
    height: "100%",
    resizeMode: "cover",
    alignSelf: "center",
    borderRadius: 10, // Rounded corners
  },
  carouselContainer: {
    alignItems: "center",
    height: width / 2,
    marginTop: 20,

  },
  menuContainer: {
    alignItems: "center",

  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Space text and icon
    backgroundColor: "#fff", // Button background
    paddingVertical: 18, // Increase button height
    paddingHorizontal: 30, // Increase horizontal padding for both sides
    marginBottom: 12, // Space between buttons
    borderRadius: 16, // Smooth rounded corners
    width: "90%", // Full width for buttons
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 4 }, // Shadow offset for depth
    shadowOpacity: 0.1, // Subtle shadow opacity
    shadowRadius: 6, // Blur for the shadow
    elevation: 5, // Android shadow effect
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%", // Ensure full width usage
  },
  menuText: {
    fontSize: 20, // Larger text size
    fontWeight: "bold", // Bold text
    color: "#000", // Black text color
    marginLeft: 30, // Additional space on the left of text
  },
  menuIcon: {
    fontSize: 28, // Icon size for visual balance
  },


  settingsHeader: {
    height: height * 0.15,
  },
  headerContent: {
    marginLeft: 0,
    marginTop: '15%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: width,
    height: '50%'
  },
  headerHeading: {
    marginLeft: 20,
  },

  settingsHeaderContent: {
    marginLeft: 0,
    marginTop: '15%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    width: width,
    height: '50%'
  },
  heading: {
    fontSize: 18,
    fontWeight: '600'
  },
  headingAndAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
