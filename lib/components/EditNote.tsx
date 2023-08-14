import React from 'react';
import { Note } from '../../types';
import EditNoteScreen from '../screens/EditNoteScreen';
import { EditNoteProps } from '../../types';

const EditNote: React.FC<EditNoteProps> = ({ route, navigation }) => {
  const { note, onSave } = route.params;

  React.useEffect(() => {
    navigation.setOptions({ headerTitle: `Edit Note ${note.id}` });
  }, [navigation, note]);

  return <EditNoteScreen {...{ route, navigation }} />;
};

export default EditNote;
