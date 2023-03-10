import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';

function PhotoScroller() {
    const [newImages, setNewImages] = useState<string[]>([]);
  
    const handleNewImage = async () => {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets) {
        const newImageUris = result.assets.map(asset => asset.uri);
        setNewImages(prevImages => [...prevImages, ...newImageUris]);
      }
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
            <Image style={styles.image} source={require("./public/cityScape.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/darkOx.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/ox.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/darkPenguin.png")} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={styles.image} source={require("./public/penguin.png")} />
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
