import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
// import heic2any from 'react-native-heic-converter';

function PhotoScroller() {
  const [newImages, setNewImages] = useState<string[]>([]);

  const handleNewImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // if (!result.canceled && result.assets) {
    //   const newImageUris = await Promise.all(
    //     result.assets.map(async (asset) => {
    //       if (asset.uri.endsWith('.heic')) {
    //         const convertedBlob = await heic2any({blob: await fetch(asset.uri).then(res => res.blob())});
    //         const convertedUri = URL.createObjectURL(convertedBlob);
    //         return convertedUri;
    //       } else {
    //         return asset.uri;
    //       }
    //     }),
    //   );
    //   setNewImages((prevImages) => [...newImageUris, ...prevImages]);
    // }
  };
  
    return (
      <View style={styles.container}>
        <Text style={styles.selectText}>Select a Photo</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity onPress={handleNewImage}>
            <Image style={styles.image} source={require("./public/new.png")} />
          </TouchableOpacity>
          {newImages.map(uri => (
            <TouchableOpacity key={uri}>
              <Image style={styles.image} source={{ uri }} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/festival.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/church.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/gallery.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/blues.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/islam.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/stadium.png")} />
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
