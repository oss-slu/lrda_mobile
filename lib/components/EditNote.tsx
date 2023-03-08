import React from 'react';
import { Note } from '../../types';
import EditNoteScreen from '../screens/EditNoteScreen';

type EditNoteProps = {
  route: { params: { note: Note; onSave: (note: Note) => void } };
  navigation: { setOptions: (options: { headerTitle: string }) => void };
};

const EditNote: React.FC<EditNoteProps> = ({ route, navigation }) => {
  const { note, onSave } = route.params;

  React.useEffect(() => {
    navigation.setOptions({ headerTitle: `Edit Note ${note.id}` });
  }, [navigation, note]);

  return <EditNoteScreen route={{
      params: {
          note: {
              id: 0,
              text: ''
          },
          onSave: function (note: Note): void {
              throw new Error('Function not implemented.');
          }
      }
  }} {...{ note, onSave }} />;
};

export default EditNote;
