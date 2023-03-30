import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Note, RootStackParamList } from '../../types';
import PhotoScroller from '../components/photoScroller';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [titleText, setTitleText] = useState('');
  const [bodyText, setBodyText] = useState('');

  const createNote = async (title: string, body: string) => {
    const response = await fetch("http://lived-religion-dev.rerum.io/deer-lr/create", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "type": "message",
        "title": title,
        "BodyText": body,
        "creator": "http://devstore.rerum.io/v1/id/5da75981e4b07f0c56c0f7f9"
      })
    });

    const obj = await response.json();
    console.log(obj["@id"]);
    return obj["@id"];
  };

  const saveNote = async () => {
    try {
      const id = await createNote(titleText, bodyText);
      const note: Note = { id, text: titleText };

      if (route.params?.onSave) {
        route.params.onSave(note);
      }
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'hidden' }}>     
      <TextInput
        style={styles.title}
        placeholder="Title your note here"
        onChangeText={(text) => setTitleText(text)}
        value={titleText}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'hidden' }}>
        <PhotoScroller />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write your note here"
            multiline={true}
            textAlignVertical="top"
            onChangeText={(text) => setBodyText(text)}
            value={bodyText}
          />
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    height: 60,
    borderColor: '#111111',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 20,
    padding: 10,
    textAlign: 'center',
    fontSize: 30,
  },
  inputContainer: {
    height: 400,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    borderColor: '#111111',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
  },
  saveButton: {
    backgroundColor: '#C7EBB3',
    paddingHorizontal: 120,
    padding: 10,
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: 'center',
  },
  saveText: {
    color: '#111111',
    fontWeight: 'bold',
  },
});

export default AddNoteScreen;
