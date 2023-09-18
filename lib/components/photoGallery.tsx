import React, { useState, useEffect, forwardRef, useImperativeHandle, } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {launchImageLibrary} from 'react-native-image-picker';

const openImagePicker = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const handleNewMedia = async () => {
        const { status } = await requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera permissions to make this work!");
          return;
        }
        const cameraResult = await launchCameraAsync({
          mediaTypes: MediaTypeOptions.All,
          allowsEditing: false,
          aspect: [3, 4],
          quality: 0.75,
          videoMaxDuration: 300,
        });
  
        if (!cameraResult.canceled) {
          handleImageSelection(cameraResult);
        }
      };

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        setSelectedImage(imageUri);
      }
    });
  };