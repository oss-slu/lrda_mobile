import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const NotesContext = React.createContext();

function HomeScreen({ navigation }) {
  const { notes } = useContext(NotesContext);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNote')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      {notes.map((note, index) => (
  <TouchableOpacity
    key={index}
    style={styles.noteContainer}
    onPress={() =>
      navigation.navigate('EditNote', {
        note,
        index,
      })
    }
  >
    <Text style={styles.noteTitle}>{note.title}</Text>
    <Text style={styles.noteDate}>{new Date(note.date).toDateString()}</Text>
  </TouchableOpacity>
))}
    </View>
  );
}



function AddNoteScreen({ navigation }) {
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const { setNotes } = useContext(NotesContext);

  const saveNote = () => {
    setNotes(prevNotes => [
      ...prevNotes,
      {
        title,
        text: note,
        date: date.toISOString(),
      },
    ]);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Title"
        value={title}
        onChangeText={text => setTitle(text)}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Enter your note here"
        value={note}
        onChangeText={text => setNote(text)}
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditNoteScreen({ navigation, route }) {
  const { note, index } = route.params;
  const [editedNote, setEditedNote] = useState(note.text);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const { notes, setNotes } = useContext(NotesContext);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={editedTitle}
        onChangeText={text => setEditedTitle(text)}
      />
      <TextInput
        style={styles.textInput}
        value={editedNote}
        onChangeText={text => setEditedNote(text)}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          setNotes(prevNotes => {
            prevNotes[index] = { title: editedTitle, text: editedNote, date: note.date };
            return [...prevNotes];
          });
          navigation.navigate('Home');
        }}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}


function Note({ note, index, onPress }) {
  const date = new Date(note.date);
  const formattedDate = date.toLocaleDateString();

  return (
    <TouchableOpacity
      key={index}
      style={styles.noteContainer}
      onPress={onPress}>
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteText}>{note.text}</Text>
      <Text style={styles.noteDate}>{formattedDate}</Text>
    </TouchableOpacity>
  );
}



export default function App() {
const [notes, setNotes] = useState([]);

return (
<NotesContext.Provider value={{ notes, setNotes }}>
<NavigationContainer>
<Stack.Navigator initialRouteName="Home">
<Stack.Screen name="Home" component={HomeScreen} />
<Stack.Screen name="AddNote" component={AddNoteScreen} />
<Stack.Screen name="EditNote" component={EditNoteScreen} />
</Stack.Navigator>
</NavigationContainer>
</NotesContext.Provider>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
padding: 20,
backgroundColor: '#fff',
alignItems: 'center',
justifyContent: 'center',
},
addButton: {
backgroundColor: '#333',
width: 60,
height: 60,
borderRadius: 30,
alignItems: 'center',
justifyContent: 'center',
position: 'absolute',
bottom: 20,
right: 20,
shadowColor: '#333',
shadowOpacity: 0.3,
shadowRadius: 10,
shadowOffset: { width: 0, height: 0 },
},
addButtonText: {
color: '#fff',
fontSize: 24,
},
noteContainer: {
backgroundColor: '#f7f7f7',
padding: 20,
marginVertical: 10,
borderRadius: 10,
width: '90%',
shadowColor: '#333',
shadowOpacity: 0.3,
shadowRadius: 10,
shadowOffset: { width: 0, height: 0 },
},
noteText: {
fontSize: 18,
},
noteTitle: {
  fontSize: 20,
  fontWeight: 'bold',
},
textInput: {
borderWidth: 1,
borderColor: '#333',
padding: 10,
width: '90%',
marginBottom: 20,
borderRadius: 10,
},
saveButton: {
backgroundColor: '#333',
padding: 15,
width: '90%',
alignItems: 'center',
borderRadius: 10,
},
saveButtonText: {
color: '#fff',
fontSize: 18,
},
editButton: {
backgroundColor: 'transparent',
padding: 5,
alignSelf: 'flex-end',
},
editButtonText: {
color: '#333',
fontSize: 18,
},
});