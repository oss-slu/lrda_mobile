import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

async function convertHeicToJpg(uri: string) {
  const convertedImage = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
  return convertedImage.uri;
}

async function uploadImage(uri: string): Promise<string> {
  // Fetch the file and create a blob
  const response = await fetch(uri);
  const blob = await response.blob();

  // Create a new FormData object
  let data = new FormData();

  // Create a file-like object
  let file = {
    uri: uri,
    name: `photo.${uri.split('.').pop()}`,
    type: `image/${uri.split('.').pop()}`,
  };

  // Append the blob to the FormData object
  data.append('file', blob, file.name);

  // Execute the API call
  return fetch("http://s3-proxy.rerum.io/S3/uploadFile", {
    method: "POST",
    mode: "cors",
    body: data
  })
  .then(resp => {
    // Get the URL of the media from the response
    if(resp.ok) return resp.headers.get("Location");
  })
  .catch(err => {
    console.error(err);
    return err;
  });
}



function PhotoScroller() {
  const [newImages, setNewImages] = useState<string[]>([]);

  const handleNewImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      console.log(uri);

      if (uri.endsWith('.heic') || uri.endsWith('.HEIC')) {
        const jpgUri = await convertHeicToJpg(uri);
        const uploadedUrl = await uploadImage(jpgUri);
        setNewImages([...newImages, uploadedUrl]);
      } else {
        const uploadedUrl = await uploadImage(uri);
        setNewImages([...newImages, uploadedUrl]);
      }
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
