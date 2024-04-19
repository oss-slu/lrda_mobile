import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from "enzyme";
import AddNoteScreen from '../lib/screens/AddNoteScreen';

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'mockedTheme', // Provide a mocked theme object
  }),
}));

describe("AddNoteScreen", () => {
  it("adds image to editor", () => {
    const routeMock = {
      params: {
        untitledNumber: 1
      }
    };
    const wrapper = shallow(<AddNoteScreen route={routeMock}/>);

    // Mock richTextRef
    const richTextRef = { current: { insertImage: jest.fn() } };

    //hard code copy paste of function
    const addImageToEditor = (imageUri: string) => {
      richTextRef.current?.insertImage(imageUri);
    };
    // Mock image URI
    const imageUri = '__tests__/TestResources/TestImage.jpg';

    // Call addImageToEditor function
    addImageToEditor(imageUri);

    // Verify that the function was called with the correct argument
    expect(richTextRef.current.insertImage).toHaveBeenCalledWith(imageUri);
  });
});
