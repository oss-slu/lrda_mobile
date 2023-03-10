import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

interface ImagePickerResult {
  cancelled: boolean;
  uri?: string;
  width?: number;
  height?: number;
  type?: string;
  fileUri?: string;
  base64?: string;
  exif?: any;
  videoOrientation?: number;
  duration?: number;
  errorMessage?: string;
}

function PhotoScroller(){
    const [selectedImage, setSelectedImage] = useState(null);
    const [selected, toggleSelected] = useState(false);

    const handleNewImage = async () => {
        const result: ImagePickerResult = await launchImageLibraryAsync({
          mediaTypes: MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        setSelectedImage(result.assets[0].uri);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.selectText} >Select a Photo</Text>
            <ScrollView horizontal = {true} showsHorizontalScrollIndicator= {false}>
                <TouchableOpacity onPress={handleNewImage} >
                    <Image  style={styles.image} source={require('./public/new.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
                </TouchableOpacity>
                
                <TouchableOpacity>
                    <Image style={styles.image} source={require('./public/cityScape.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.image} source={require('./public/darkOx.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.image} source={require('./public/ox.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.image} source={require('./public/darkPenguin.png')} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image style={styles.image} source={require('./public/penguin.png')} />
                </TouchableOpacity>
            </ScrollView>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      marginBottom: 10,
      maxWidth: 355,
      justifyContent: 'center',

    },
    image:{
        width: 100,
        height: 100,
        borderRadius: 20,
        marginRight: 10,
    },
    selectText: {
        marginBottom: 5,
    },
  });
  
export default PhotoScroller;
