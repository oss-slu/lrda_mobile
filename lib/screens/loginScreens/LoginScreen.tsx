import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { User } from '../../utils/user_class';

const user = User.getInstance();

type LoginProps = {
  navigation: any;
  route: any;
};

const LoginScreen: React.FC<LoginProps> = ({ navigation, route }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [snackState, toggleSnack] = useState(false);

  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      // If a user is already cached navigate home
      if(user.getId()){
        handleGoHome();
      }
      await SplashScreen.hideAsync();
    })();
  }, []);

  const handleGoHome = () => {
    navigation.navigate("Home");
  };
  
  // temp adding a login for stuart if we click skip
  const handleSkip = async () => {
    await user.login("Stuart Ray", "4");
    handleGoHome();
  }
  const handleGoRegister = () => {
    navigation.navigate("Register");
  };

  const onDismissSnackBar = () => toggleSnack(false);

  const handleLogin = async () => {
    if (username === '' || password === '') {
      toggleSnack(!snackState);
    } else {
      try {
        const status = await user.login(username, password);
        if(status == 'success'){
          setUsername('');
          setPassword('');
          handleGoHome();
        }
      } catch (error) {
        toggleSnack(true);
      }
    }
  };
  
  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}
      style={{backgroundColor: '#F4DFCD',}}
      >
      <Text style={[styles.logo, { marginTop: -40 }]}>Where's Religion</Text>

      <View style={styles.inputView}>
        <TextInput
          style={styles.inputText}
          placeholder="Username..."
          placeholderTextColor="#003f5c"
          value={username}
          onChangeText={text => setUsername(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          secureTextEntry
          style={styles.inputText}
          placeholder="Password..."
          placeholderTextColor="#003f5c"
          value={password}
          onChangeText={text => setPassword(text)}
        />
      </View>
        <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      <View style = {styles.buttons}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.Btn} onPress={handleGoRegister}>
          <Text style={styles.loginText}>Register</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.skip} onPress={handleSkip}>
          <Text style={{color: 'white', fontSize: 18, marginRight: 20,}}>Skip</Text>
          <Ionicons name="arrow-forward-outline" size={24} color="white" />
        </TouchableOpacity> */}
      </View>
      <Snackbar
        visible={snackState}
        onDismiss={onDismissSnackBar}
        style = {{justifyContent: 'center', alignItems: 'center', backgroundColor: 'white',}}
        >
        <Text style={{ textAlign: 'center', }}>
          Invalid User Credentials
        </Text>
      </Snackbar>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
  
  

export default LoginScreen;
