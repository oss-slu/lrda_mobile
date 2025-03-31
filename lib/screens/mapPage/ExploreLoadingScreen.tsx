import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { defaultTextFont } from '../../../styles/globalStyles';

const ExploreLoadingScreen = () => {
  const { theme, isDarkmode } = useTheme();

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#0000ff" />
      <View style={{padding: 5}}></View>
      <Text style={{ ...defaultTextFont, color: theme.text }}>Loading your location...</Text>
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
