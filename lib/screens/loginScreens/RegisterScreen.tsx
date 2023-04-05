import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

type RegisterProps = {
  navigation: any;
  route: any;
};

const RegisterScreen: React.FC<RegisterProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
    <Text style={[styles.logo, { marginTop: -40 }]}>Create Account</Text>

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
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Username..."
          placeholderTextColor="#003f5c"
          onChangeText={text => setUsername(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Region..."
          placeholderTextColor="#003f5c"
          onChangeText={text => setRegion(text)}
        />
      </View>
    <View style = {styles.buttons}>
        <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>Submit</Text>
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
      width: "100%",
      borderRadius: 25, 
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
  
  

export default RegisterScreen;
