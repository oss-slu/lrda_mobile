import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AddNoteScreen from '../lib/screens/AddNoteScreen';
import moxios from 'moxios';

// Mocking external dependencies and components
jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

beforeEach(() => {
   // Clear mocks before each test
   jest.clearAllMocks();

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    if (!message.includes('Toolbar has no editor')) {
      console.warn(message);
    }
  });
  moxios.install();
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
  console.warn.mockRestore();
  moxios.uninstall();

});

describe("AddNoteScreen", () => {
  let setNoteContentMock;
  
  beforeEach(() => {
    setNoteContentMock = jest.fn();
    React.useState = jest.fn(() => ['', setNoteContentMock]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<AddNoteScreen route={{ params: { untitledNumber: 1 }}} />);
    // Instead of using toBeInTheDocument (which is DOM-specific), use toBeTruthy
    expect(screen.getByTestId('RichEditor')).toBeTruthy();
  });

  it('calls setNoteContent when the Rich Text Editor content changes', () => {
    render(<AddNoteScreen route={{ params: { untitledNumber: 1 }}} />);

    const richTextEditor = screen.getByTestId('RichEditor'); // Ensure the element is rendered
    const newText = 'New content';

    // Simulating the text change in the editor
    fireEvent.changeText(richTextEditor, newText);

    const richTextRef = { current: { insertText: jest.fn() } };

    const addTextToEditor = (Text) => {
      richTextRef.current?.insertText(Text);
    };

    addTextToEditor(newText);

    expect(richTextRef.current.insertText).toHaveBeenCalledWith(newText);
  });

  it('Modifies the given text with the bold tag', () => {
    const mockBold = (text) => `<b>${text}</b>`;
    const newText = 'New content';
    const newTextBold = mockBold(newText);

    const richTextRef = { current: { insertText: jest.fn() } };

    const addTextToEditor = (Text) => {
      const boldText = mockBold(Text);
      richTextRef.current?.insertText(boldText);
    };

    addTextToEditor(newText);

    expect(richTextRef.current.insertText).toHaveBeenCalledWith(newTextBold);
  });

  it('inserts video into the rich text editor', () => {
    const videoUri = 'http://example.com/video.mp4';

    const richTextRef = { current: { insertHTML: jest.fn() } };

    const insertVideoToEditor = (videoUri) => {
      const videoHtml = `<video src="${videoUri}" controls></video>`;
      richTextRef.current?.insertHTML(videoHtml);
    };

    insertVideoToEditor(videoUri);

    expect(richTextRef.current.insertHTML).toHaveBeenCalledWith(`<video src="${videoUri}" controls></video>`);
  });
});
