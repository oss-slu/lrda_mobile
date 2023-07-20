import {
    View,
    Image,
    TouchableOpacity,
  } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const sideMenu = (data: any, rowMap: any) => {
    return (
      <View style={styles.rowBack} key={data.index}>
        <TouchableOpacity>
          <TouchableOpacity onPress={() => publishNote(data.item.id, rowMap)}>
            <Ionicons name="earth" size={30} color="black" />
          </TouchableOpacity>
        </TouchableOpacity>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
          {isPrivate ? (
            <TouchableOpacity
              style={{
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                right: 20,
              }}
              onPress={() => deleteNote(data.item.id, rowMap)}
            >
              <Ionicons name="trash-outline" size={24} color="#111111" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const deleteNote = (data: any, rowMap: any) => {
    if (rowMap[data]) {
      rowMap[data].closeRow();
    }
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== data));
    deleteNoteFromAPI(data);
  };

  async function publishNote(data: any, rowMap:any){
    if (rowMap[data]) {
      rowMap[data].closeRow();
    }
    const foundNote = notes.find((note) => note.id === data);
    const editedNote: Note = {
      id: foundNote?.id || "",
      title: foundNote?.title || "",
      text: foundNote?.text || "",
      creator: foundNote?.creator || "",
      media: foundNote?.media || [],
      latitude: foundNote?.latitude || "",
      longitude: foundNote?.longitude || "",
      audio: foundNote?.audio || [],
      published: !foundNote?.published || false,
      time: foundNote?.time || "",
      tags: foundNote?.tags || [],
    };
    await ApiService.overwriteNote(editedNote);
    refreshPage();
  };

  const renderList = (notes: Note[]) => {
    return (
      isPrivate ? 
        <SwipeListView
          data={notes}
          renderItem={renderItem}
          renderHiddenItem={sideMenu}
          leftActivationValue={160}
          rightActivationValue={-160}
          leftOpenValue={75}
          rightOpenValue={-75}
          stopLeftSwipe={175}
          stopRightSwipe={-175}
          keyExtractor={(item) => item.id}
          onRightAction={(data, rowMap) => deleteNote(data, rowMap)}
          onLeftAction={(data, rowMap) => publishNote(data, rowMap)}
        />
      :
        <SwipeListView
          data={notes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
    );
  };

  const renderItem = ({ item }: { item: Note }) => {
    const mediaItem = item.media[0];
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={1}
        style={styles.noteContainer}
        onPress={() =>
          navigation.navigate("EditNote", {
            note: item,
            onSave: (editedNote: Note) => {
              updateNote(editedNote);
              refreshPage();
            },
          })
        }
      >
        <View style={{ flexDirection: "row" }}>
          {mediaItem?.getType() === "image" ? (
            <Image
              style={styles.preview}
              source={{ uri: mediaItem.getUri() }}
            />
          ) : mediaItem?.getType() === "video" ? (
            <Image
              style={styles.preview}
              source={{ uri: (mediaItem as VideoType).getThumbnail() }}
            />
          ) : (
            <Image
              source={require("../components/public/noPreview.png")}
              style={styles.preview}
            />
          )}
          <View
            style={{ alignSelf: "center", position: "absolute", left: 120 }}
          >
            <Text style={styles.noteTitle}>
              {item.title.length > textLength
                ? item.title.slice(0, textLength) + "..."
                : item.title}
            </Text>

            <Text style={styles.noteText}>
              {`${item.time.split(", ")[0]}\n${item.time.split(", ")[1]}`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            right: 10,
          }}
        >
          {item.published ? (
            <Ionicons name="earth" size={24} color="#111111" />
          ) : (
            <Ionicons name="earth-outline" size={24} color="#111111" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };