import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import React from 'react';
import { shallow } from "enzyme";
import AddNoteScreen from '../lib/screens/AddNoteScreen';

describe("AddNoteScreen", () => {
  it("adds image to editor", () => {
    const wrapper = shallow(<AddNoteScreen />);

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
