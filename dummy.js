import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, DatePickerIOS } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const NotesContext = React.createContext();

function HomeScreen({ navigation }) {
  const { notes, setNotes } = useContext(NotesContext);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNote')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      {notes.map((note, index) => (
        <View key={index} style={styles.noteContainer}>
          <Text style={styles.noteText}>{note.title}</Text>
          <Text style={styles.dateText}>{note.date}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate('EditNote', {
                note,
                index,
              })
            }>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function AddNoteScreen({ navigation }) {
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { setNotes } = useContext(NotesContext);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Enter the title of your note here"
        value={noteTitle}
        onChangeText={text => setNoteTitle(text)}
      />
      <DatePickerIOS
        date={selectedDate}
        onDateChange={date => setSelectedDate(date)}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          setNotes(prevNotes => [...prevNotes, { title: noteTitle, date: selectedDate }]);
          navigation.navigate('Home');
        }}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditNoteScreen({ navigation, route }) {
  const { note, index } = route.params;
  const [editedNoteTitle, setEditedNoteTitle] = useState(note.title);
  const [editedDate, setEditedDate] = useState(note.date);
  const { notes, setNotes } = useContext(NotesContext);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={editedNoteTitle}
        onChangeText={text => setEditedNoteTitle(text)}
/>
<DatePickerIOS
date={editedDate}
onDateChange={date => setEditedDate(date)}
/>
<TouchableOpacity
style={styles.saveButton}
onPress={() => {
setNotes(prevNotes => {
prevNotes[index] = { title: editedNoteTitle, date: editedDate };
return [...prevNotes];
});
navigation.navigate('Home');
}}>
<Text style={styles.saveButtonText}>Save</Text>
</TouchableOpacity>
</View>
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
alignItems: 'center',
justifyContent: 'center',
},
textInput: {
height: 40,
width: '80%',
borderColor: 'gray',
borderWidth: 1,
marginTop: 20,
padding: 10,
},
addButton: {
position: 'absolute',
bottom: 20,
right: 20,
backgroundColor: 'lightblue',
width: 60,
height: 60,
borderRadius: 30,
alignItems: 'center',
justifyContent: 'center',
},
addButtonText: {
fontSize: 40,
},
noteContainer: {
width: '80%',
marginTop: 20,
padding: 10,
backgroundColor: 'lightgray',
alignItems: 'center',
},
noteText: {
fontSize: 20,
},
dateText: {
fontSize: 15,
},
editButton: {
position: 'absolute',
bottom: 0,
right: 0,
backgroundColor: 'lightgreen',
padding: 5,
},
editButtonText: {
fontSize: 15,
},
saveButton: {
backgroundColor: 'lightblue',
padding: 10,
marginTop: 20,
},
saveButtonText: {
fontSize: 20,
color: 'white',
},
});