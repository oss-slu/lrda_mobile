import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Linking,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import Feather from 'react-native-vector-icons/Feather';
import { onlineResources, analogueResources } from '../data'; // Update path as needed
import { defaultTextFont } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

function ResourceScreen({ navigation }) {
  const { theme } = useTheme();

  const renderOnlineResource = ({ item }) => (
    <TouchableOpacity
      style={styles.resourceBox}
      onPress={() => Linking.openURL(item.url)}
    >
      <Text style={styles.resourceLink}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderAnalogueResource = ({ item }) => (
    <View style={styles.resourceBox}>
      <Text style={styles.resourceText}>{item}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar translucent backgroundColor="transparent" />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={30} />
          </TouchableOpacity>
          <View style={styles.headerHeading}>
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Resources</Text>
          </View>
        </View>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.sectionTitle}>Online Resources</Text>
        <FlatList
          data={onlineResources}
          renderItem={renderOnlineResource}
          keyExtractor={(item) => item.url}
          scrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Analogue Resources</Text>
        <FlatList
          data={analogueResources}
          renderItem={renderAnalogueResource}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

export default ResourceScreen;

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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerHeading: {
    marginLeft: 20,
  },
  mainContent: {
    padding: 16,
    paddingBottom: 200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  resourceBox: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resourceLink: {
    color: '#1a73e8',
    fontSize: 14,
  },
  resourceText: {
    fontSize: 14,
    color: '#000',
  },
});
