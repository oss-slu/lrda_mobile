import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

const ExploreLoadingScreen = () => {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading your location...</Text>
    </View>
  );
}

// Add this style to your stylesheet
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ExploreLoadingScreen;
