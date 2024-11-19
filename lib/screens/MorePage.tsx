import React from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  SafeAreaView,

  StyleSheet,
  Dimensions,
  Switch,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { useTheme } from "../components/ThemeProvider";
import { useDispatch } from "react-redux";


const user = User.getInstance();
const { width, height } = Dimensions.get("window");

export default function MorePage() {
  const { theme, isDarkmode, toggleDarkmode } = useTheme();
  const dispatch = useDispatch();

  const handleToggleDarkMode = () => {
    if (toggleDarkmode) {
      toggleDarkmode();
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
      await user.logout(dispatch);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headText, { color: theme.text }]}>About</Text>
      </View>
      <SafeAreaView>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 140 }]}>
          {/* About Section Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.titleText,{color:theme.text}]}>What is Where’s Religion?</Text>
            <Text style={[styles.bodyText, { color: theme.text }]}>
            Where’s Religion? is an open-source application developed by humanities faculty and IT professionals at Saint Louis University that supports in-person research, remote data entry, media sharing, and mapping. The app is designed to facilitate a more robust public understanding of religion through rigorous scholarly methods. Our conviction is that the study of religion must account for the wide range of embodied experiences, improvised practices, material cultures, and shared spaces that humans inhabit. Through a research methodology that moves beyond analysis of sacred texts, creeds, and official teachings, Where’s Religion? provides a platform to diversify the data we study and to advance the study of religion we all encounter in everyday life.</Text>
            <Text style={[styles.bodyText, { color: theme.text }]}>
Where’s Religion? is a keystone outcome of the Center on Lived Religion at Saint Louis University. We have received external support from the Henry Luce Foundation ($400,000 in 2018 and $470,000 in 2022), and internal support from the College of Arts & Sciences, the Office for the Vice President for Research and the Research Computing Group, Open Source with SLU, the Walter J. Ong, S.J., Center for Digital Humanities, and the CREST Research Center (Culture, Religion, Ethics, Science, Technology).</Text>
          </View>

          {/* Initiative Team Section */}
          <View style={styles.initiativeTeamSection}>
            
            <View style={styles.initiativeTeamMembers}>
            <View style={styles.teamMemberContainer}>
  {Image.resolveAssetSource(require('../../assets/Rachel.jpg')).uri ? (
    <Image source={require('../../assets/Rachel.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
  <Text style={[styles.teamName,{color:theme.text}]}>Rachel Lindsey</Text>
  <Text style={[styles.teamRole,{color:theme.text}]}>Director of Center on Lived Religion</Text>
</View>

              <View style={styles.initiativeMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Adam.jpg')).uri ? (
    <Image source={require('../../assets/Adam.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.initiativeMemberName,{color:theme.text}]}>Adam Park</Text>
                <Text style={[styles.initiativeMemberRole,{color:theme.text}]}>Associate Director of Research (COLR)</Text>
              </View>
            </View>
            <View style={styles.initiativeTeamMembers}>
              <View style={styles.teamMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Yash.jpg')).uri ? (
    <Image source={require('../../assets/Yash.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.teamName,{color:theme.text}]}>Yash Bhatia</Text>
                <Text style={[styles.teamRole,{color:theme.text}]}>Software Engineer and Tech Lead </Text>
              </View>
            </View>
          </View>

          {/* Development Team Section */}
          <View style={styles.teamSection}>
            <Text style={styles.teamTitle}>The Development Team</Text>
            <View style={styles.teamMembersRow}>
              <View style={styles.teamMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Patrick.jpg')).uri ? (
    <Image source={require('../../assets/Patrick.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.teamName,{color:theme.text}]}>Patrick Cuba</Text>
                <Text style={[styles.teamRole,{color:theme.text}]}>IT Architect</Text>
              </View>
              <View style={styles.teamMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Bryan.jpg')).uri ? (
    <Image source={require('../../assets/Bryan.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.teamName,{color:theme.text}]}>Bryan Haberberger</Text>
                <Text style={[styles.teamRole,{color:theme.text}]}>Full Stack Developer</Text>
              </View>
            </View>
            <View style={styles.teamMembersRow}>
              <View style={styles.teamMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Stuart.jpg')).uri ? (
    <Image source={require('../../assets/Stuart.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.teamName,{color:theme.text}]}>Stuart Ray</Text>
                <Text style={[styles.teamRole,{color:theme.text}]}>Developer</Text>
              </View>
              <View style={styles.teamMemberContainer}>
              {Image.resolveAssetSource(require('../../assets/Izak.jpg')).uri ? (
    <Image source={require('../../assets/Izak.jpg')} style={styles.teamImage} />
  ) : (
    <Text>Image not available</Text>
  )}
                <Text style={[styles.teamName,{color:theme.text}]}>Izak Robles</Text>
                <Text style={[styles.teamRole,{color:theme.text}]}>Developer</Text>
              </View>
            </View>
          </View>

          {/* Dark Mode and Logout at the End of ScrollView */}
          <View style={styles.bottomContainer}>
          <View
              style={[
                styles.switchContainer,
                { backgroundColor: theme.background },
              ]}
            >
              <Text style={[styles.switchText, { color: theme.text }]}testID="Light Mode ">
                {isDarkmode ? "Light Mode" : "Dark Mode"}
              </Text>
              <Switch
                testID="dark-mode-switch"
                trackColor={{
                  false: "black",
                  true: theme.text,
                }}
                thumbColor={theme.primaryColor}
                onValueChange={handleToggleDarkMode}
                value={isDarkmode}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.primaryColor },
              ]}
              onPress={handleEmail}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.text },
                ]}
              >
                Report
              </Text>
              <Ionicons
                name="mail-outline"
                size={24}
                color={theme.text}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.primaryColor },
              ]}
              onPress={handleVisitWebsite}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.text },
                ]}
              >
                Visit Our Website
              </Text>
              <Ionicons
                name="globe-outline"
                size={24}
                color={theme.text}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              key="Logout"
              style={[
                styles.logout,
                { backgroundColor: isDarkmode ? "white" : "black" },
              ]}
              onPress={onLogoutPress}
            >
              <Text
                style={[
                  styles.logoutText,
                  { color: isDarkmode ? "black" : "white" },
                ]}
              >
                Logout
              </Text>
              <Ionicons
                name={"log-out-outline"}
                size={30}
                color={isDarkmode ? "black" : "white"}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: height * 0.02, justifyContent: "center", alignItems: "center" },
  headText: { fontSize: 32, fontWeight: "bold", paddingTop: 40 },
  container: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20 },
  textContainer: { width: "100%", alignItems: "center", marginTop: 20 },
  titleText: { fontSize: 28, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  bodyText: { fontSize: 16, lineHeight: 24, textAlign: "justify", marginBottom: 15, paddingHorizontal: 10 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: "90%",
    borderRadius: 15,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },


  // Team Section
  teamSection: { width: "100%", padding: 20, alignItems: "center" },
  teamTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  teamMembersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  teamMemberContainer: { alignItems: 'center', width: '45%' },
  teamImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  teamName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  teamRole: { fontSize: 14, textAlign: "center" },

  // Initiative Team Section
  initiativeTeamSection: { width: "100%", padding: 20, alignItems: "center" },
  initiativeTeamTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  initiativeTeamMembers: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 16 },
  initiativeMemberContainer: { alignItems: "center", width: "45%" },
  initiativeMemberName: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  initiativeMemberRole: { fontSize: 14, textAlign: "center" },

  // Bottom Container for Dark Mode and Logout
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  switchText: { fontSize: 18, fontWeight: "500" },
  logout: { flexDirection: "row", justifyContent: "center", alignItems: "center", height: 50, width: "90%", borderRadius: 15, marginTop:10},
  logoutText: { fontSize: 20, fontWeight: "600", marginRight: 10 },
});
