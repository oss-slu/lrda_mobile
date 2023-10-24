import React, { useState, useEffect, memo, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Note } from "../../../types";
import RenderHTML from "react-native-render-html";
import { useTheme } from "../../components/ThemeProvider"
import { color } from "react-native-reanimated";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  note?: Note;
}

const NoteDetailModal: React.FC<Props> = memo(
  ({ isVisible, onClose, note }) => {
    const [isImageTouched, setImageTouched] = useState(false);
    const [isTextTouched, setTextTouched] = useState(true);
    const [creatorName, setCreatorName] = useState("");
    const { height, width } = useWindowDimensions();
    const { theme } = useTheme();

    useEffect(() => {
      setTextTouched(true);
      if (note?.creator) {
        fetch(note.creator)
          .then((response) => response.json())
          .then((data) => {
            if (data.name) {
              setCreatorName(data.name);
            }
          })
          .catch((err) => console.error("Error fetching creator: ", err));
      }
    }, [note]);

    const handleImageTouchStart = () => {
      setImageTouched(true);
      setTextTouched(false);
    };

    const handleTextTouchStart = () => {
      setTextTouched(true);
      setImageTouched(false);
    };

    // Declare a new state variable for image loading
    const [imageLoadedState, setImageLoadedState] = useState<{
      [key: string]: boolean;
    }>({});

    const images: string = useMemo(() => {
      if (note?.images) {
        return note.images.filter(
          (mediaItem: any) =>
            mediaItem.uri.endsWith(".jpg") || mediaItem.uri.endsWith(".png")
        );
      }
      return [];
    }, [note]);

    const handleLoad = (uri: string) => {
      setImageLoadedState((prev) => ({ ...prev, [uri]: true }));
    };
    let newNote = false;
    if (note?.description && note.description.includes("<div>")) {
      newNote = true;
    }

    const html = note?.description;

    const htmlSource = useMemo(() => {
      return { html };
    }, [html]);

    const MemoizedRenderHtml = React.memo(RenderHTML);

    const styles = StyleSheet.create({
      closeButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 3,
        borderRadius: 25,
        backgroundColor: theme.primaryColor,
      },
      closeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.text,
        alignItems: "center",
        justifyContent: "center",
      },
      textContainer: {
        padding: 10,
        paddingLeft: 15, // Indentation for the body text
        backgroundColor: theme.primaryColor,
        borderTopColor: theme.text,
        borderTopWidth: 2,
      },
      modalTitle: {
        fontSize: 26,
        fontWeight: "bold",
        marginLeft: 15, // Less indent for title
        marginBottom: 8,
        color: theme.text,
      },
      modalText: {
        fontSize: 18,
        lineHeight: 24,
        marginLeft: 15, // Uniform indentation for other texts
        color: theme.text,
      },
      metaDataContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10,
      },
      creatorContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      creatorIcon: {
        fontSize: 16,
        color: theme.text,
      },
      creatorText: {
        fontSize: 16,
        color: theme.text,
        marginLeft: 5,
      },
      dateContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      dateIcon: {
        fontSize: 16,
        color: theme.text,
      },
      dateText: {
        fontSize: 16,
        color: theme.text,
        marginLeft: 5,
      },
      timeContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      timeIcon: {
        fontSize: 16,
        color: theme.text,
      },
      timeText: {
        fontSize: 16,
        color: theme.text,
        marginLeft: 5,
      },
      imageContainer: {
        width: "100%",
        height: 360,
        marginBottom: 2,
        overflow: "hidden",
        borderColor: '#e0e0e0'
      },
      image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
      },
      separator: {
        // Divider line style
        height: 1,
        width: "90%",
        backgroundColor: "#e0e0e0",
        marginLeft: "5%",
        marginRight: "5%",
        marginBottom: 20,
      },
    });

    return (
      <Modal animationType="slide" transparent={false} visible={isVisible}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <View style={styles.closeIcon}>
            <Ionicons name="close" size={30} color="#000" />
          </View>
        </TouchableOpacity>

        <ScrollView
          style={{ height: isImageTouched ? "80%" : "50%" }}
          onTouchStart={images.length > 2 ? handleImageTouchStart : undefined}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => {
              return (
                <View key={index} style={styles.imageContainer}>
                  {!imageLoadedState[image.uri] && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.image}
                    onLoad={() => handleLoad(image.uri)}
                  />
                </View>
              );
            })
          ) : (
            <Text
              style={{
                alignSelf: "center",
                justifyContent: "center",
                marginTop: 200,
              }}
            >
              No images
            </Text>
          )}
        </ScrollView>
        <View
          style={[
            styles.textContainer,
            {
              height: isTextTouched ? "60%" : "30%",
            },
          ]}
          onTouchStart={handleTextTouchStart}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>{note?.title}</Text>
            <View style={styles.metaDataContainer}>
              <View style={styles.creatorContainer}>
                <Ionicons name="person-circle-outline" size={18} color={theme.text} />
                <Text style={styles.creatorText}>{creatorName}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={18} color={theme.text} />
                <Text style={styles.dateText}>{note?.time}</Text>
              </View>
            </View>
            <View key="Tags Container" style={{flexDirection: 'row', marginHorizontal: 15,}}>
            <Ionicons name="pricetags-outline" size={20} color={theme.text} style={{marginRight: 10}}/>

            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={{ width: "100%", paddingLeft: 5, marginBottom: 10, }}
            >
              {note?.tags &&
                note.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        height: 20,
                        width: 20,
                        transform: [{ rotate: "45deg" }],
                        position: "absolute",
                        left: 2,
                        borderLeftWidth: 2,
                        borderBottomWidth: 2,
                        borderColor: theme.text,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          height: 5,
                          width: 5,
                          left: 2,
                          borderRadius: 10,
                          backgroundColor: theme.text,
                          marginRight: 5,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        borderColor: theme.text,
                        borderRightWidth: 2,
                        borderBottomWidth: 2,
                        borderTopWidth: 2,
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        flexDirection: "row",
                        marginLeft: 10,
                      }}
                    >
                      <Text style={styles.creatorText}>{tag}</Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
            <View
              style={{
                height: 2,
                width: "100%",
                backgroundColor: theme.text,
                marginBottom: 10,
              }}
            ></View>
            {newNote ? (
              <MemoizedRenderHtml
                baseStyle={{ color: theme.text }}
                contentWidth={width}
                source={htmlSource}
              />
            ) : (
              <Text style={{color: theme.text}}>{note?.description}</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  }
);

export default NoteDetailModal;
