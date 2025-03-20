import React, { useState, useEffect, } from "react";
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
  StatusBar,
  Linking,
  Alert,
  TextInput,
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
import { deleteUser } from "firebase/auth";
import { ref, remove } from "firebase/database";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject } from "firebase/storage";
import { auth } from "../config";
import { db, realtimeDb, storage } from "../config/firebase";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { collection, addDoc, getDoc,} from "firebase/firestore";
import { KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from "react-native"; // Import necessary components

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
  const navigation = useNavigation(); // Get navigation instance
  const dispatch = useDispatch();
  const userObject = User.getInstance();
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

  const handleThemeOpen = () => {
    setIsThemeOpen(!isThemeOpen);
  }

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  }
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reasons, setReasons] = useState([]); // To track selected reasons
  const [keyboardVisible, setKeyboardVisible] = useState(false); // Track keyboard visibility


const [additionalDetails, setAdditionalDetails] = useState("");

const toggleReason = (reason) => {
  if (reasons.includes(reason)) {
    setReasons(reasons.filter((r) => r !== reason)); // Remove if already selected
  } else {
    setReasons([...reasons, reason]); // Add if not already selected
  }
}

  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode();
    }
  };


  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onDeleteAccount = async () => {
    try {
      if (reasons.length === 0) {
        Alert.alert("Error", "Please select at least one reason for account deletion.");
        return;
      }
  
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in. Please log in to delete your account.");
        return;
      }
  
      const userId = currentUser.uid;
  
      // Check if the document exists before trying to delete it
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        console.log("Firestore document not found for user:", userId);
        Alert.alert("Error", "No Firestore data found for the user. Cannot delete.");
        return;
      }
  
      console.log("User document exists, proceeding with deletion...");
  
      // Proceed with deletion
      await deleteDoc(userDocRef);
      console.log("Firestore document deleted successfully");
  
      // Try to delete the user from Firebase Authentication
      try {
        await deleteUser(currentUser);
        Alert.alert("Success", "Your account has been successfully deleted.");
        onLogoutPress();
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          console.log("Session expired. Reauthenticating the user...");
          Alert.alert("Reauthenticate", "Your session has expired. Please log in again to delete your account.");
        } else {
          console.error("Error deleting user:", error);
          Alert.alert("Error", "Failed to delete account. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    }
  };
  

  
  const handleEmail = () => {
    const emailAddress = "yashkamal.bhatia@slu.edu";
    const subject = "Bug Report on 'Where's Religion?'";
    const body = "Please provide details of your issue you are facing here.";
    const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(emailUrl);
  };

  const handleVisitWebsite = () => {
    const websiteUrl = "https://www.wheresreligion.org";
    Linking.openURL(websiteUrl);
  };

  const onLogoutPress = async () => {
    try {
      await User.getInstance().logout(dispatch);
      dispatch(clearThemeReducer())
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteUserAccount = () => {
    setTimeout(()=> {
      onLogoutPress();
    },3000)
  }

  const handleReportClick = () => {
    const email = 'yashkamal.bhatia@slu.edu'; // The predefined email address
    const subject = 'Bug Report on \'Where\'s Religion?'; // The subject of the email
    const body = 'Please provide details of your issue you are facing here.'; // The body of the email

    // Create the mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the email client
    Linking.openURL(mailtoLink)
      .catch((err) => console.error('Error opening email client:', err));
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
                    { backgroundColor: theme.black,
                      width: width > 1000 ? 50 : 30,
                      height: width > 1000 ? 50 : 30,
                     },
                  ]}
                  onPress={() => {
                    navigation.navigate("AccountPage");
                  }}
                >
                  <Text style={styles.pfpText}>{userInitials}</Text>
                </TouchableOpacity>
                <Text style={styles.pageTitle}>More</Text>
              </View>
              <ThemeToggle isDarkmode={isDarkmode} toggleDarkmode={toggleDarkmode} testID="dark-mode-toggle"/>
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
              <MenuItem title="About" iconName="information-circle-outline" onPress={()=> {}}/>
              <MenuItem title="Resource" iconName="link-outline" onPress={() => navigation.navigate("Resource")} />
              <MenuItem title="Meet our team" iconName="people-outline" onPress={() => navigation.navigate("TeamPage")} />
              <MenuItem title="Settings" iconName="settings-outline" onPress={handleSettingsToggle} />
              <MenuItem title="FAQ" iconName="help-circle-outline" onPress={()=> {}}/>
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
              <View style={styles.headerHeading} testID="settings-header">
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
              <TouchableOpacity
                onPress={()=>setShowDeleteModal(true)}
              >
                <SettingOptions optionName={'Delete My Account'} icon={'delete'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReportClick}>
                <SettingOptions optionName={'Report an Issue'} icon={'report'} />
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
                  onPress={handleThemeOpen} testID="close-app-theme-modal"
                >
                  <Entypo name={'cross'} size={30} />
                </TouchableOpacity>
              </View>
              <AppThemeSelectorScreen />
            </View>
          </Modal>

          <Modal
      visible={showDeleteModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <KeyboardAvoidingView
        style={[styles.modalOverlay, { justifyContent: keyboardVisible ? "flex-end" : "center" }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust for iOS and Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0} // Offset for iOS
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.modalContent, { backgroundColor: isDarkmode ? "#333" : "#fff" }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Why are you deleting your account?</Text>

            {/* Checkbox Options */}
            <View style={styles.checkboxOption}>
              <TouchableOpacity style={styles.checkbox} onPress={() => toggleReason("Slow Loading")}>
                <Text style={[styles.checkboxSymbol, { color: theme.text }]}>
                  {reasons.includes("Slow Loading") ? "☑" : "☐"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.checkboxText, { color: theme.text }]}>Slow Loading</Text>
            </View>
            <View style={styles.checkboxOption}>
              <TouchableOpacity style={styles.checkbox} onPress={() => toggleReason("Connectivity Issues")}>
                <Text style={[styles.checkboxSymbol, { color: theme.text }]}>
                  {reasons.includes("Connectivity Issues") ? "☑" : "☐"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.checkboxText, { color: theme.text }]}>Connectivity Issues</Text>
            </View>
            <View style={styles.checkboxOption}>
              <TouchableOpacity style={styles.checkbox} onPress={() => toggleReason("No Reason")}>
                <Text style={[styles.checkboxSymbol, { color: theme.text }]}>
                  {reasons.includes("No Reason") ? "☑" : "☐"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.checkboxText, { color: theme.text }]}>No Reason</Text>
            </View>
           

            {/* Additional Details */}
            <TextInput
              placeholder="Additional details (optional)"
              placeholderTextColor={isDarkmode ? "#aaa" : "#555"}
              style={[styles.textInput, { borderColor: isDarkmode ? "#555" : "#ccc", color: theme.text }]}
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
            />

            {/* Buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "red" }]} onPress={onDeleteAccount}>
                <Text style={styles.modalButtonText}>Confirm Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: isDarkmode ? "#6c757d" : "#007bff" },
                ]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    height: width > 500 ? height * 0.12 : height * 0.19,
  },
  profile: { flexDirection: "row", alignItems: "center" },
  userAccountAndPageTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width > 500? '13%':'27%',

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
    marginTop: width > 500? '5%' : "15%",
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
    marginTop: width > 500? '4%' : "15%",
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

  deleteAccountBulletPoints: {
    fontSize: 8,
  },
  deleteAccountActionButtons: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: 'balck',
    borderWidth: 1,
    borderRadius: 12,
  },
  switchText: { fontSize: 18, fontWeight: "500" },
  logout: { flexDirection: "row", justifyContent: "center", alignItems: "center", height: 50, width: "90%", borderRadius: 15, marginTop:10},
  logoutText: { fontSize: 20, fontWeight: "600", marginRight: 10 },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  radioText: {
    fontSize: 18,
    marginLeft: 10,
  },
  textInput: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "45%",
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxSymbol: {
    fontSize: 20,
  },
  checkboxText: {
    fontSize: 18,
  },
});

