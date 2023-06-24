import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from "@expo/vector-icons";

async function convertHeicToJpg(uri: string) {
  console.log("Converting HEIC to JPG..."); // Log before starting the conversion
  const convertedImage = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
  console.log("Converted image URI: ", convertedImage.uri); // Log the URI of the converted image
  return convertedImage.uri;
}

async function uploadImage(uri: string): Promise<string> {
  console.log('uploadImage - Input URI:', uri);

  let data = new FormData();
  const uniqueName = `image-${Date.now()}.jpg`; // Generate a unique name based on the current timestamp

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], uniqueName, { type: 'image/jpeg' });
    console.log('Blob size:', blob.size);
    console.log('File size:', file.size);

    data.append('file', file);
  } else {
    let base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    base64 = `data:image/jpeg;base64,${base64}`;
    data.append('file', {
      type: 'image/jpeg',
      uri: base64,
      name: uniqueName,
    });
  }

  const S3_PROXY_PREFIX = "http://99.7.218.98:8080/S3/"; // S3 Proxy
  // const S3_PROXY_PREFIX = "http://:8080/S3/"; // localhost proxy

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
    }
  })
  .catch(err => {
    console.error('uploadImage - Error:', err);
    return err;
  });
}

function PhotoScroller({ newImages, setNewImages }: { newImages: string[], setNewImages: React.Dispatch<React.SetStateAction<string[]>> }) {
  const handleImageSelection = async (result: { canceled?: false; assets: any; }) => {
    const { uri } = result.assets[0];
    console.log("Selected image URI: ", uri);

    if (uri.endsWith('.heic') || uri.endsWith('.HEIC')) {
      const jpgUri = await convertHeicToJpg(uri);
      const uploadedUrl = await uploadImage(jpgUri);
      setNewImages([...newImages, uploadedUrl]);
    } else {
      const uploadedUrl = await uploadImage(uri);
      setNewImages([...newImages, uploadedUrl]);
    }
  };

  const handleNewImage = async () => {
    Alert.alert(
      "Upload Photo",
      "Choose from library or take a photo",
      [
        {
          text: "Take a Photo",
          onPress: async () => {
            const { status } = await requestCameraPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need camera permissions to make this work!');
              return;
            }

            console.log("Opening camera...");
            const cameraResult = await launchCameraAsync({
              mediaTypes: MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!cameraResult.canceled) {
              handleImageSelection(cameraResult);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } = await requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              alert('Sorry, we need media library permissions to make this work!');
              return;
            }

            console.log("Opening image library...");
            const libraryResult = await launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!libraryResult.canceled) {
              handleImageSelection(libraryResult);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity onPress={handleNewImage}>
          <Image style={styles.image} source={require("./public/new.png")} />
        </TouchableOpacity>
        {newImages.map((uri, index) => (
          <View key={index}>
            <TouchableOpacity style={styles.trash} onPress={() => handleDeleteImage(index)}>
              <Ionicons style={{alignSelf :'center'}} name="trash-outline" size={20} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity key={index}>
              <Image style={styles.image} source={{ uri }} />
            </TouchableOpacity>
          </View>
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
    width: '95%',
    justifyContent: 'center',
  },
  image:{
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
  },
  trash: {
    position: 'absolute',
    zIndex: 99,
    height: '20%',
    width: '20%',
    backgroundColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
  },
});

export default PhotoScroller;
