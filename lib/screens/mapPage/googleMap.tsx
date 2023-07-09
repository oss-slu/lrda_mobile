import React from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Image, StyleSheet, View } from 'react-native';

export default function GoogleMap() {
  // For demo purposes, use two made-up lat-long coordinates
  const note1 = { latitude: 37.78825, longitude: -122.4324 };
  const note2 = { latitude: 37.68825, longitude: -122.3324 };

  return (
    <View style={styles.container}>
      <MapView 
        provider={PROVIDER_GOOGLE}
        style={styles.map} 
        initialRegion={{
          latitude: note1.latitude,
          longitude: note1.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={note1}
        >
          <Image source={require("../../components/public/marker.png")} style={{height: 35, width: 35}} />
        </Marker>

        <Marker
          coordinate={note2}
        >
          <Image source={require("../../components/public/marker.png")} style={{height: 35, width: 35}} />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
