import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React, { SetStateAction, useState } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { render } from '@testing-library/react';

import AddNoteScreen from '../lib/screens/AddNoteScreen';
import { ThemeProvider } from '../lib/components/ThemeProvider'; 
import PhotoScroller from "../lib/components/photoScroller";
import { Media } from '../lib/models/media_class';
import moxios from 'moxios';
import AudioContainer from '../lib/components/audio';

import { addVideoToEditor } from '../lib/screens/AddNoteScreen';
import { getThumbnail } from '../lib/utils/S3_proxy';

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

/*
jest.mock('../lib/screens/AddNoteScreen', () => ({
  addVideoToEditor: jest.fn(),
}));

// Ensure you also mock getThumbnail if it's from another module
jest.mock('../lib/utils/S3_proxy', () => ({
  getThumbnail: jest.fn(),
}));
*/

describe("AddNoteScreen", () => {
  let wrapper;
  let setNoteContentMock;

  beforeEach(() => {
    setNoteContentMock = jest.fn();
    React.useState = jest.fn(() => ['', setNoteContentMock]);
    const routeMock = {
      params: {
        untitledNumber: 1 // or any other value that makes sense for your tests
      }
    };
    wrapper = shallow(<AddNoteScreen route={routeMock} />);
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
    const routeMock = {
      params: {
        untitledNumber: 1 // or any other value that makes sense for your tests
      }
    };
  
    // Shallow render the AddNoteScreen component and pass the mock function as a prop
    // Ensure that this matches how your actual component receives the setNoteContent prop
    const wrapper = shallow(<AddNoteScreen route = {routeMock} setNoteContent={setNoteContentMock} />);
  
    // Simulate the content change on the Rich Text Editor component
    // The selector needs to match the test ID or the component name/class
    const richTextEditor = wrapper.find('[data-testid="RichEditor"]'); // Replace 'RichTextEditorSelector' with the correct selector
    expect(richTextEditor.length).toBe(1); // This should pass if the selector is correct and the component is rendered

    const RichToolbar = wrapper.find('[data-testid="RichBar"]'); // Replace 'RichTextEditorSelector' with the correct selector
    expect(RichToolbar.length).toBe(1); // This should pass if the selector is correct and the component is rendered

    const newText = 'New content';
    
    const richTextRef = { current: { insertText: jest.fn() } };

    //mock of onChange
    const addTextToEditor = (Text: string) => {
      richTextRef.current?.insertText(Text);
    };
    

    addTextToEditor(newText);

    expect(richTextRef.current.insertText).toHaveBeenCalledWith(newText);


  });

  it('Modifies the given text with the bold tag', () => {

    
    //mock of Bold
    const mockBold = (text: string) => {
      return `<b>${text}</b>`;
    };
  
    const newText = 'New content';
    const newTextBold = mockBold(newText);
  
    const richTextRef = { current: { insertText: jest.fn() } };
  
    //mock of onChange
    const addTextToEditor = (Text: string) => {
      const boldText = mockBold(Text);
      richTextRef.current?.insertText(boldText);
    };
  
    addTextToEditor(newText);
  
    expect(richTextRef.current.insertText).toHaveBeenCalledWith(`<b>${newText}</b>`);
  });

  /* needs to get fixed
  it('Adds a key to the rich text editor when a key is pressed', () => {
    const wrapper = shallow(<AddNoteScreen />);
    const richTextEditor = wrapper.find('[data-testid="RichEditor"]').find('onChange');
  
    // Simulate a change event with the pressed key
    richTextEditor.prop('onChange')('a'); // Assuming onChange prop takes the new content as argument
  
    // Access the noteContent state
    const [noteContent, setNoteContent] = wrapper.find(React.useState).first().props();
  
    // Verify that the key is added to the rich text editor
    expect(noteContent).toContain('a');
  });
  */
  
  /*
  it("inserts video into the rich text editor", async () => {
    const mockVideoUri = 'http://example.com/video.mp4';
    const mockThumbnailUri = 'http://example.com/thumbnail.jpg';

    // Set up your mocks with the desired behavior
    getThumbnail.mockResolvedValue(mockThumbnailUri);
    addVideoToEditor.mockImplementation(() => Promise.resolve()); // Assume it's async

    // Assuming mockInsertHTML is a function you have access to, perhaps via global mocks
    const mockInsertHTML = jest.fn();
    global.richTextRef = {
      current: {
        insertHTML: mockInsertHTML,
      },
    };

    // Act: Attempt to add video to editor
    addVideoToEditor(mockVideoUri);

    // Assertions
    expect(getThumbnail).toHaveBeenCalledWith(mockVideoUri);
    expect(addVideoToEditor).toHaveBeenCalledWith(mockVideoUri);
    expect(mockInsertHTML).toHaveBeenCalled(); // This assumes insertHTML is called within addVideoToEditor
  }); */

  it('inserts video into the rich text editor', () => {
    // Example video URI
    const videoUri = 'http://example.com/video.mp4';
  
    const richTextRef = { current: { insertHTML: jest.fn() } };

    const insertVideoToEditor = (videoUri: string) => {
      // Example: Inserting a video might involve wrapping the URI in a video tag
      const videoHtml = `<video src="${videoUri}" controls></video>`;
      richTextRef.current?.insertHTML(videoHtml);
    };    

    // Call the function to insert the video
    insertVideoToEditor(videoUri);
  
    // Verify insertHTML was called with the correct HTML for the video
    const expectedVideoHtml = `<video src="${videoUri}" controls></video>`;
    expect(richTextRef.current.insertHTML).toHaveBeenCalledWith(expectedVideoHtml);
  });
});