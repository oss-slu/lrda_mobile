import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from "../components/ThemeProvider";

const { width, height } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();

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
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>About</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          About Where’s Religion?
        </Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Where’s Religion? is an open-source application developed by humanities faculty and IT professionals at Saint Louis University that supports in-person research, remote data entry, media sharing, and mapping. The app is designed to facilitate a more robust public understanding of religion through rigorous scholarly methods. Our conviction is that the study of religion must account for the wide range of embodied experiences, improvised practices, material cultures, and shared spaces that humans inhabit. Through a research methodology that moves beyond analysis of sacred texts, creeds, and official teachings, Where’s Religion? provides a platform to diversify the data we study and to advance the study of religion we all encounter in everyday life.
        </Text>
        <Text style={[styles.paragraph, { color: theme.text }]}>
          Where’s Religion? is a keystone outcome of the Center on Lived Religion at Saint Louis University. We have received external support from the Henry Luce Foundation ($400,000 in 2018 and $470,000 in 2022), and internal support from the College of Arts & Sciences, the Office for the Vice President for Research and the Research Computing Group, Open Source with SLU, the Walter J. Ong, S.J., Center for Digital Humanities, and the CREST Research Center (Culture, Religion, Ethics, Science, Technology).
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textAlign: "justify",
  },
});