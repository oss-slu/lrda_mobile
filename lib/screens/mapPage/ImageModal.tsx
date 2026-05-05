import React, { useState } from "react";
import { Modal, View, ScrollView, Text, Image, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";

interface ImageType {
  uri: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  images: ImageType[];
}

const { width } = Dimensions.get("window");

const ImageModal: React.FC<Props> = ({ isVisible, onClose, images }) => {
  const [imageLoadedState, setImageLoadedState] = useState<{ [key: string]: boolean }>({});
  const [isImageTouched, setIsImageTouched] = useState(false);

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View className="w-full flex-1 items-center justify-center bg-primary pt-[45px]">
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={images && images.length > 2 ? handleImageTouchStart : undefined}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} className="w-full items-center bg-primary">
                {!imageLoadedState[image.uri] && <ActivityIndicator size="large" color="#0000ff" />}
                <Image source={{ uri: image.uri }} style={{ width, height: width }} onLoad={() => handleLoad(image.uri)} />
              </View>
            ))
          ) : (
            <Text className="mt-[200px] justify-center self-center font-inter text-foreground">No images</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          className="mb-[30px] mt-5 h-10 w-[75px] items-center justify-center rounded-[5px] bg-[#ddd] p-2.5"
          onPress={onClose}
          testID="image-component"
        >
          <Text className="font-inter" testID="close-button">
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageModal;
