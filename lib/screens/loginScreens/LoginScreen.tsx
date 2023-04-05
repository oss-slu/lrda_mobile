import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type LoginProps = {
  navigation: any;
  route: any;
};

const LoginScreen: React.FC<LoginProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoHome = () => {
    navigation.navigate("Home");
  };
  const handleGoRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
    <Text style={[styles.logo, { marginTop: -40 }]}>Where's Religion</Text>

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Email..."
          placeholderTextColor="#003f5c"
          onChangeText={text => setEmail(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..."
          placeholderTextColor="#003f5c"
          onChangeText={text => setPassword(text)}
        />
      </View>
        <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
    <View style = {styles.buttons}>
        <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.Btn} onPress={handleGoRegister}>
            <Text style={styles.loginText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skip} onPress={handleGoHome}>
            <Text style={{color: 'white', fontSize: 18, marginRight: 20,}}>Skip</Text>
            <Ionicons name="arrow-forward-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4DFCD',
    },
    logo: {
      fontWeight: "bold",
      fontSize: 50,
      color: "#111111",
      marginBottom: 70
    },
    inputView: {
        width: "80%",
        backgroundColor: '#fff',
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },      
    inputText: {
      height: 50,
      color: "#111111",
      fontSize: 16,
    },
    forgot: {
      color: '#111111',
      fontSize: 12,
      fontWeight: '400',
      marginBottom: 20,
    },
    loginBtn: {
        justifyContent: 'center',
        backgroundColor: '#C7EBB3',
        marginRight: 10,
        paddingHorizontal: 10,
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
        minWidth: "80%",
    },
    Btn: {
        justifyContent: 'center',
        backgroundColor: '#ffff',
        marginRight: 10,
        paddingHorizontal: 10,
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
        minWidth: "80%",
    },
    skip: {
        position: 'absolute',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#111111',
        borderRadius: 100,
        height: 50,
        width: 100,
        alignItems: "center",
        bottom: -110,
        right: 10,
        paddingHorizontal: 15,
    },
    loginText: {
      color: "#111111",
      fontWeight: "600",
      fontSize: 18,
    },
    buttons: {
      marginTop: 0,
    }
});
  
  

export default LoginScreen;
