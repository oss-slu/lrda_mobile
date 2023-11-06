import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React, { SetStateAction, useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';

import AddNoteScreen from '../lib/screens/AddNoteScreen';
import PhotoScroller from "../lib/components/photoScroller";
import { Media } from '../lib/models/media_class';
import moxios from 'moxios';
import AudioContainer from '../lib/components/audio';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  moxios.install();
});

// This will restore the original console methods after all tests are done
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  moxios.uninstall();
});

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

describe("AddNoteScreen", () => {
  let wrapper;
  let setNoteContentMock;

  beforeEach(() => {
    setNoteContentMock = jest.fn();
    React.useState = jest.fn(() => ['', setNoteContentMock]);
    wrapper = shallow(<AddNoteScreen />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    expect(wrapper.exists()).toBeTruthy();
  });

  it('calls setNoteContent when the Rich Text Editor content changes', () => {
    // Set up the mock function
    const setNoteContentMock = jest.fn();
  
    // Shallow render the AddNoteScreen component and pass the mock function as a prop
    // Ensure that this matches how your actual component receives the setNoteContent prop
    const wrapper = shallow(<AddNoteScreen setNoteContent={setNoteContentMock} />);
  
    // Simulate the content change on the Rich Text Editor component
    // The selector needs to match the test ID or the component name/class
    const richTextEditor = wrapper.find('[data-testid="RichEditor"]'); // Replace 'RichTextEditorSelector' with the correct selector
    expect(richTextEditor.length).toBe(1); // This should pass if the selector is correct and the component is rendered

    const newText = 'New content';
    richTextEditor.prop('onChange')(newText);

    expect(setNoteContentMock).toHaveBeenCalledWith(newText);
  });


});
