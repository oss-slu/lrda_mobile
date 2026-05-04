import React, { useState } from "react";
import { Modal, View, ScrollView, Text, Image, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "../../components/ThemeProvider";

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
  const { theme } = useTheme();

  const handleLoad = (uri: string) => {
    setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
  };

  const handleImageTouchStart = () => setIsImageTouched(!isImageTouched);

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center pt-[45px] w-full bg-primary">
        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={images && images.length > 2 ? handleImageTouchStart : undefined}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} className="items-center w-full bg-primary">
                {!imageLoadedState[image.uri] && <ActivityIndicator size="large" color="#0000ff" />}
                <Image source={{ uri: image.uri }} style={{ width, height: width }} onLoad={() => handleLoad(image.uri)} />
              </View>
            ))
          ) : (
            <Text className="font-inter self-center justify-center mt-[200px] text-foreground">No images</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          className="h-10 w-[75px] items-center justify-center mt-5 bg-[#ddd] p-2.5 rounded-[5px] mb-[30px]"
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
