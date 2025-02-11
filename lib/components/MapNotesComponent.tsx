import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';


const { width } = Dimensions.get("window");
const CARD_HEIGHT = 170;
const CARD_WIDTH = width * 0.8;
export const MapNotesComponent = ({ index, marker, onViewNote }) => {

  const { theme, isDarkmode } = useTheme()
  return (
    <View
      style={[
        styles.card,
        isDarkmode && styles.cardDark,
      ]}
      key={index}
    >
      {marker.images[0] && <Image source={marker.images[0]} style={styles.cardImage} resizeMode="cover" />}
      <View style={styles.textContent}>
        <View style={styles.leftContent}>
        <Text numberOfLines={1} style={[styles.cardtitle]}>
          {marker.title || "Untitled"}
        </Text>
        <Text numberOfLines={1} style={[styles.cardDescription]}>
          {(typeof marker.description === "string" ? marker.description : "No description available").replace(/<[^>]+>/g, "").substring(0, 200).trim()}
        </Text>
        </View>

        <View style={styles.button}>
          <TouchableOpacity onPress={() => onViewNote(marker)} style={[{ borderColor: theme.text,}]}>
           <View style={styles.buttonContent}>
           {/* <Text style={[styles.textSign, { color: theme.text }]}>View Note</Text> */}
           <FontAwesome6 name='arrow-right-long' size={20} color={'white'}/>
           </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  selectedMapTypeText: { fontWeight: "bold", color: "blue" },
  scrollView: { position: "absolute", bottom: 60, left: 0, right: 0, paddingVertical: 10 },
  card: {
    elevation: 2,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
    justifyContent: 'flex-end',

  },
  cardDark: {
    backgroundColor: "#222", // Dark mode card background
  },
  cardImage: { flex: 2, width: "100%", height: "100%", alignSelf: "center" },
  textContent: { 
    flexDirection: 'row',
    flex: 2, 
    padding: 10,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark transparent background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Slight border color for the edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, // Slightly darker shadow
    shadowRadius: 20,
    elevation: 5, // For Android shadow
    width: CARD_WIDTH,
    justifyContent: 'space-evenly',
  },
  cardtitle: { fontSize: 12, fontWeight: "bold", color: 'white' },
  cardDescription: { fontSize: 12, color: 'white' },
  markerWrap: { alignItems: "center", justifyContent: "center", width: 50, height: 50 },
  marker: { width: 30, height: 30 },
  signIn: { width: "100%", padding: 5, justifyContent: "center", alignItems: "center", borderRadius: 3 },
  textSign: { fontSize: 14, fontWeight: "bold" },
  leftContent: {
    width: '70%',
  },
  button: { 
    alignItems: "center", 
    marginTop: 5,
    width: '30%',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});
