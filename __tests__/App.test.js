import React from 'react';
import {render, fireEvent } from '@testing-library/react-native';
import App from './App';

describe('Note Taking App', () => {
  it('renders the home screen with no notes', () => {
    const { getByText } = render(<App />);
    expect(getByText('No notes yet')).toBeTruthy();
  });

  it('allows the user to add a new note', () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    fireEvent.press(getByText('+'));
    const titleInput = getByPlaceholderText('Title');
    const noteInput = getByPlaceholderText('Enter your note here');
    const saveButton = getByText('Save');
    fireEvent.changeText(titleInput, 'Test Note Title');
    fireEvent.changeText(noteInput, 'Test note text.');
    fireEvent.press(saveButton);
    expect(getByText('Test Note Title')).toBeTruthy();
  });

  it('allows the user to edit an existing note', () => {
    const { getByText, getAllByTestId } = render(<App />);
    fireEvent.press(getByText('+'));
    const titleInput = getByPlaceholderText('Title');
    const noteInput = getByPlaceholderText('Enter your note here');
    const saveButton = getByText('Save');
    fireEvent.changeText(titleInput, 'Test Note Title');
    fireEvent.changeText(noteInput, 'Test note text.');
    fireEvent.press(saveButton);
    const noteItem = getAllByTestId('noteItem')[0];
    fireEvent.press(noteItem);
    const editTitleInput = getByPlaceholderText('Title');
    const editNoteInput = getByPlaceholderText('Enter your note here');
    const editSaveButton = getByText('Save');
    fireEvent.changeText(editTitleInput, 'Edited Title');
    fireEvent.changeText(editNoteInput, 'Edited note text.');
    fireEvent.press(editSaveButton);
    expect(getByText('Edited Title')).toBeTruthy();
  });

});
