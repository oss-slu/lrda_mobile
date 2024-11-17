import React, { useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import ClusteredMapView from 'react-native-maps-super-cluster';
import { Marker } from "react-native-maps";

const TestClusterMap = () => {
  const _map = useRef(null);
  const [region, setRegion] = useState({
    latitude: 38.631393,
    longitude: -90.192226,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Sample markers for testing
  const markers = [
    { id: 1, coordinate: { latitude: 38.631393, longitude: -90.192226 } },
    { id: 2, coordinate: { latitude: 38.631493, longitude: -90.192326 } },
    { id: 3, coordinate: { latitude: 38.632393, longitude: -90.193226 } },
  ];

  const renderMarker = (marker) => (
    <Marker key={marker.id} coordinate={marker.coordinate} />
  );

  const renderCluster = (cluster) => (
    <Marker coordinate={cluster.coordinate}>
      <View style={styles.clusterStyle}>
        <Text style={styles.clusterText}>{cluster.pointCount}</Text>
      </View>
    </Marker>
  );

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={_map}
        initialRegion={region}
        style={StyleSheet.absoluteFillObject}
        data={markers}
        renderMarker={renderMarker}
        renderCluster={renderCluster}
      />
    </View>
  );
};

export default TestClusterMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clusterStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 125, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  clusterText: {
    color: "white",
    fontWeight: "bold",
  },
});
