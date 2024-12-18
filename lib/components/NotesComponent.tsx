import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, Alert, Dimensions } from 'react-native'
import LoadingImage from './loadingImage'
import * as Location from "expo-location";
import axios from 'axios';


const {width, height} = Dimensions.get('window');

function NotesComponent({ IsImage, resolvedImageURI, ImageType, textLength, showTime, item, isPublished, isDarkmode }) {
    {
        console.log("inside node data ====> ", item, "\n\n\n");
    }
    const [address, setAddress] = useState(null);
    const [author, setAuthor] = useState('anonymous')

    const fetchUserName = async (url) => {
        console.log("in fetch userName ", url)
      try {
        // Perform the GET request
        const response = await axios.get(url);
        const data = response.data;
    
        // Fetch the author
        const author = data.name; // "karthik"
    
        console.log("Fetched data:", { author});
    
        setAuthor(author)
       
      } catch (error) {
        console.error("Error fetching data:", error.message);
    
        // Handle the error (you can throw it or return a default value)
        throw new Error("Failed to fetch data.");
      }
    };
    
    const fetchAddress = async (latitude, longitude) => {
        // Convert latitude and longitude to numbers
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            console.error("Invalid latitude or longitude values:", latitude, longitude);
            // Alert.alert("Error", "Invalid latitude or longitude values.");
            return;
        }

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                // Alert.alert("Permission Denied", "Permission to access location was denied.");
                return;
            }

            const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

            if (result.length > 0) {
                const location = result[0];
                const formattedAddress = `${location.name || ""}, ${location.street || ""}, ${location.city || ""}, ${location.region || ""}, ${location.country || ""}`;
                setAddress(formattedAddress.trim());
            } else {
                // Alert.alert("Error", "No address found for the given coordinates.");
            }
        } catch (error) {
            // console.error("Error fetching address:", error);
            // Alert.alert("Error", "Unable to fetch address.");
        }
    };


    useEffect(() => {
        console.log("lat and long, ", item.latitude, item.longitude)
        fetchAddress(item.latitude, item.longitude)
        console.log("inside the useEffect ", item.creator)
        fetchUserName(item.creator)
    }, [item])
    return (
        <View style={[styles.notesContainer, { backgroundColor: isDarkmode ? '#3f3f3f' : 'white' }]}>
            
                {IsImage && resolvedImageURI ? (
                    <View>
                        <LoadingImage
                            imageURI={resolvedImageURI}
                            type={ImageType}
                            isImage={true}
                            height={70}
                            width={100}
                        />
                    </View>
                ) : (
                    <View>
                        <LoadingImage imageURI={""} type={ImageType} isImage={false} height={70}
                            width={100} />
                    </View>
                )}

                <View style={styles.notesTxtContent}>
                    <View style={styles.columnData}>
                        <Text style={[styles.noteTitle, { color: isDarkmode ? '#d9d9d9' : 'black' }]}>
                            {item.title.length > textLength
                                ? item.title.slice(0, textLength) + "..."
                                : item.title}
                        </Text>

                        <Text style={[styles.noteText, { color: isDarkmode ? '#d9d9d9' : 'black' }]}>{showTime}</Text>
                    </View>
                    {/* <View style={styles.columnData}>
                        <Text>{address?.slice(0, 20)}...</Text>
                        <Text>{author}</Text>
                    </View> */}
                </View>

           

        </View>

    )
}

export default NotesComponent;

const styles = StyleSheet.create({
    notesContainer: {
       flexDirection: 'row',
       width: '95%',
       margin: 10,
       height: height * 0.1,
       alignItems: 'center',
       paddingHorizontal: 20,
       borderRadius: 10,
       
    },

    notesTxtContent: {
        marginLeft: 20,
        flexWrap: 'wrap',
    },
    columnData: {
        height: '80%',
        justifyContent: 'space-evenly'
    },
   

})