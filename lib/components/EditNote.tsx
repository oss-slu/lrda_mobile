import React from 'react';
import { Note } from '../../types';
import EditNoteScreen from '../screens/EditNoteScreen';

export type EditNoteProps = {
  route: { params: { note: Note; onSave: (note: Note) => void } };
  navigation: {
    setOptions: (options: { headerTitle: string }) => void;
    goBack: () => void;
  };
};

const EditNote: React.FC<EditNoteProps> = ({ route, navigation }) => {
  const { note, onSave } = route.params;

  React.useEffect(() => {
    navigation.setOptions({ headerTitle: `Edit Note ${note.id}` });
  }, [navigation, note]);

  return <EditNoteScreen {...{ route, navigation }} />;
};

export default EditNote;
