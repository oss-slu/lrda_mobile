import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Note, RootStackParamList } from '../../types';
import PhotoScroller from '../components/photoScroller';

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [text, setText] = useState('');

  const createNote = async (text: string) => {
    const response = await fetch("http://lived-religion-dev.rerum.io/deer-lr/create", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const obj = await response.json();
    console.log(obj["@id"]);
    return obj["@id"];
  };

  const saveNote = async () => {
    try {
      const id = await createNote(text);
      const note: Note = { id, text };

      if (route.params?.onSave) {
        route.params.onSave(note);
      }
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
  };

  //console.log("Rendering AddNoteScreen");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.title}
        placeholder="Title your note here"
        onChangeText={(text) => setText(text)}
        value={text}
      />
      <ScrollView>
        <PhotoScroller />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write your note here"
            multiline={true}
            textAlignVertical="top" // Add this line
            //onChangeText={(text) => setText(text)}
            //value={text}
          />
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
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
    marginBottom: 10,
    alignSelf: 'center',
  },
  saveText: {
    color: '#111111',
    fontWeight: 'bold',
  },
});

export default AddNoteScreen;
