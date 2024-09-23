//This file consists of unused code.


/*                     The below code belongs to loginScreen.tsx              */  

//removed this import 
//path-> lib/screens/loginScreens/LoginScreen.tsx
//line number -> 16
import { signInWithEmailAndPassword } from "firebase/auth";


//removed this import 
//path-> lib/screens/loginScreens/LoginScreen.tsx
//line number -> 23
import { Keyboard } from "react-native";

//removed this import 
//path-> lib/screens/loginScreens/LoginScreen.tsx
//line number -> 17
import { auth } from "../../config";  // Import the Firebase auth



//removed this part
//path-> lib/screens/loginScreens/LoginScreen.tsx
//line number -> 67 to 69

const handleGoRegister = () => {
    navigation.navigate("Register");
  };


  
//removed this part
//path-> lib/screens/loginScreens/LoginScreen.tsx
//line number -> 100 to 107

  const clearOnboarding = async () => {
    try {
      await removeItem("onboarded");
      console.log("Onboarding key cleared!");
    } catch (error) {
      console.error("Failed to clear the onboarding key.", error);
    }
  };



/*                     The below code belongs to user_class.ts               */  

//removed this part
//path-> lib/models/user_class.ts
//line number -> 65 to 93

 // const response = await fetch(
      //   "https://lived-religion-dev.rerum.io/deer-lr/login",
      //   {
      //     method: "POST",
      //     mode: "cors",
      //     cache: "no-cache",
      //     headers: {
      //       "Content-Type": "application/json;charset=utf-8",
      //     },
      //     body: JSON.stringify({
      //       username: username,
      //       password: password,
      //     }),
      //   }
      // );


      // if (response.ok) {
      //   const data = await response.json();
      //   this.userData = data;
      //   if (this.userData !== null) {
      //     await this.persistUser(this.userData);
      //   }
      //   this.notifyLoginState();
      //   console.log("From userClass, Data ***************************==>>************************************ ", this.userData)
      //   return "success";
      // } else {
      //   throw new Error("There was a server error logging in.");
      // }



//removed this part
//path-> lib/models/user_class.ts
//line number -> 97 to 98

// const token = await user.getIdToken();
// console.log("user id is ", user.uid)



/*                     The below code belongs to App.tsx              */  

//removed useEffect part
//path-> /App.tsx
//line number -> 1
import React, { useEffect } from 'react';



/*                     The below code belongs to HomeScreen.tsx              */  

//removed styling part
//path-> /lib/screens/HomeScreen.tsx
//line number -> 319,320

// borderTopRightRadius: 20,
// borderBottomRightRadius: 20,




/*                     The below code belongs to ExploreScreen.js              */  

//removed this part
//path-> /lib/screens/mapPage/ExploreScreen.js
//line number -> 80

// _map.current.animateToRegion(newRegion, 350);

//removed this part
//path-> /lib/screens/mapPage/ExploreScreen.js
//line number -> 96 to 105

// console.log("STEP 3: fetchedNotes from ApiService.fetchMessages:", fetchedNotes);
// Write the count to the log file
// await RNFS.appendFile(logFilePath, `Count of fetched notes: ${fetchedNotes.length}\n`, 'utf8')
//   .then(() => {
//     console.log('Logged count to file');
//   })
//   .catch(err => {
//     console.error('Error writing to log file:', err);
//   });


/*                     The below code belongs to MorePage.tsx     

*/


//removed this import
//path-> /lib/screens/MorePage.tsx
//line number -> 17
import Accordion from "@gapur/react-native-accordion";


//removed this part
//path-> /lib/screens/MorePage.tsx
//line number -> 279 to 369

/*  Line 155
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Resources">
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "http://lived-religion-dev.rerum.io/deer-lr/dashboard.html"
                )}
              ><Text style={styles.headerText}>{"\n"}{"\t"}Our Website{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "https://guides.library.upenn.edu/ethnography/DoingEthnography"
                )}
              ><Text style={styles.headerText}>{"\t"}Guide to Enthnography{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  "http://changingminds.org/explanations/research/analysis/ethnographic_coding.htm"
                )}
              ><Text style={styles.headerText}>{"\t"}Guide to Coding{"\n"}</Text></TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEmail()}
              ><Text style={styles.headerText}>{"\t"}Report a Bug{"\n"}</Text></TouchableOpacity>
            </Accordion>
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Meet our Team">
              <Text style={{ color: theme.text }}>
                {'\n'}Insert Team Photo
              </Text>
              <Text style={{ color: theme.text }}>{'\n'}Insert Team Message</Text>
            </Accordion>
            <Accordion style={{ backgroundColor: theme.secondaryColor }} headerTitleStyle={styles.headerText} headerTitle="Frequently Asked Questions">
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="What can users do?"
                >
                  <Text style={styles.text}>
                    Explore religious traditions, find places of worship, engage in
                    meaningful discussions.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Who is it for?"
                >
                  <Text style={styles.text}>
                    Scholars, students, believers, and the curious about the world's
                    religions.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="What's unique?"
                >
                  <Text style={styles.text}>
                    Provides a modern method to capture experiences using the
                    devices that are with us every day.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Our Mission"
                >
                  <Text style={styles.text}>
                    Connect people of diverse religious backgrounds, beliefs, and
                    practices.
                  </Text>
                </Accordion>
              </View>
              <View style={styles.headerContainer}>
                <Accordion
                  style={{ backgroundColor: theme.secondaryColor }}
                  headerTitleStyle={styles.headerText}
                  headerTitle="Why use 'Where's Religion?'"
                >
                  <Text style={styles.text}>
                    Explore religious traditions, find places of worship, engage in
                    meaningful discussions.
                  </Text>
                </Accordion>
              </View>
            </Accordion>

            