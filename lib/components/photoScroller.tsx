import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

async function convertHeicToJpg(uri: string) {
  console.log("Converting HEIC to JPG..."); // Log before starting the conversion
  const convertedImage = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
  console.log("Converted image URI: ", convertedImage.uri); // Log the URI of the converted image
  return convertedImage.uri;
}

async function uploadImage(uri: string): Promise<string> {
  console.log('uploadImage - Input URI:', uri);

  const response = await fetch(uri);
  const blob = await response.blob();
  const uniqueName = `image-${Date.now()}.jpg`; // Generate a unique name based on the current timestamp
  const file = new File([blob], uniqueName, { type: 'image/jpeg' });
  console.log('Blob size:', blob.size);
  console.log('File size:', file.size);

  let data = new FormData();
  data.append('file', file);
  console.log('data file being sent as a File object: ', data);

  const S3_PROXY_PREFIX = "http://localhost:8080/S3/"; // assuming this is the correct prefix

  return fetch(S3_PROXY_PREFIX+"uploadFile", {
    method: "POST",
    mode: "cors",
    body: data
  })
  .then(resp => {
    console.log("Got the response from the upload file servlet");
    console.log('uploadImage - Server response status:', resp.status);
    if(resp.ok) {
      const location = resp.headers.get("Location");
      console.log('uploadImage - Uploaded successfully, Location:', location);
      return location;
    } else {
      console.log('uploadImage - Server response body:', resp.body);
     //uploadFailed(resp); // Assuming that you have the uploadFailed function in scope
    }
  })
  .catch(err => {
    console.error('uploadImage - Error:', err);
    return err;
  });
}




function PhotoScroller() {
  const [newImages, setNewImages] = useState<string[]>([]);

  console.log("Current images: ", newImages); // Log the current images every time the component renders

  const handleNewImage = async () => {
    console.log("Opening image library..."); // Log before opening the image library
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      console.log("Selected image URI: ", uri); // Log the URI of the selected image

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
        {newImages.map((uri, index) => (
          <TouchableOpacity key={index}>
            <Image style={styles.image} source={{ uri }} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}


// Styles for the PhotoScroller component
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

// Export the PhotoScroller component
export default PhotoScroller;
