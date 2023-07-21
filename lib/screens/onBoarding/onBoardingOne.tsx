import React, { useState, useRef } from "react";
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";

export default function OnBoardOne() {
  const [firstClick, setFirstClick] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setFirstClick(false));
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/splash.jpg")}
        style={styles.imageBackground}
      >
        {firstClick ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.title}
            onPress={fadeOut}
          >
            <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
              Where's {"\n"} Religion
            </Animated.Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loginBox}>
            <Text style={[styles.logo, {alignSelf: 'center'}]}>Welcome to Lived Religion</Text>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  logo: {
    fontWeight: "bold",
    fontSize: 50,
    color: "#111111",
    marginBottom: 70,
    alignSelf: 'center',
  },
  title: {
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    marginBottom: 200,
    paddingVertical: 200,
  },
  buttons: {
    backgroundColor: "#194dfa",
    width: 200,
    height: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 3,
  },
  loginBox: {
    alignSelf: "center",
    alignContent: "center",
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: "white",
    height: 500,
    width: 300,
    borderRadius: 10,
    elevation: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.4, 
    shadowRadius: 10,
  },
  
});
