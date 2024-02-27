import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ImageModal from '../lib/screens/mapPage/ImageModal';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      text: '#000',
    },
  }),
}));

describe("ImageModal", () => {
  const mockImages = [
    { uri: "https://example.com/image1.jpg" },
    { uri: "https://example.com/image2.jpg" }
  ];

  it("renders without crashing", () => {
    const wrapper = shallow(<ImageModal isVisible={true} onClose={() => {}} images={mockImages} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("displays the correct number of images", () => {
    const wrapper = shallow(<ImageModal isVisible={true} onClose={() => {}} images={mockImages} />);
    expect(wrapper.find('Image').length).toBe(mockImages.length);
  });

  it("handles the close button press", () => {
    const mockOnClose = jest.fn();
    const wrapper = shallow(<ImageModal isVisible={true} onClose={mockOnClose} images={mockImages} />);
    wrapper.find('TouchableOpacity').simulate('press');
    expect(mockOnClose).toHaveBeenCalled();
  });
});
