import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

const ExploreLoadingScreen = () => {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#0000ff" />
      <View style={{padding: 5}}></View>
      <Text style={{ color: 'white' }}>Loading your location...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ExploreLoadingScreen;
