import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import TagWindow from '../lib/components/tagging';
import moxios from 'moxios';


Enzyme.configure({ adapter: new Adapter() });


beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    moxios.install();
  });
  
  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
    moxios.uninstall();
  });
  
  jest.mock('../lib/components/ThemeProvider', () => ({
    useTheme: () => ({
      theme: 'mockedTheme', 
    }),
  }));
  
describe('TagWindowTest1', () => {
  const mockTags = ['Tag1', 'Tag2', 'Tag3'];
  const mockSetTags = jest.fn();

  it('renders without crashing', () => {
    const wrapper = shallow(<TagWindow tags={mockTags} setTags={mockSetTags} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('displays input field and tags list', () => {
    const wrapper = shallow(<TagWindow tags={mockTags} setTags={mockSetTags} />);
    expect(wrapper.find('TextInput').exists()).toBe(true);
    expect(wrapper.find('SwipeListView').exists()).toBe(true);
  });
  
});

  
describe('TagWindowTest2', () => {
    const mockTags = ['1', '2','3'];
    const mockSetTags = jest.fn();
  
    it('renders without crashing', () => {
      const wrapper = shallow(<TagWindow tags={mockTags} setTags={mockSetTags} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('handles tag deletion when swiping', () => {
        const wrapper = shallow(<TagWindow tags={mockTags} setTags={mockSetTags} />);
        const swipeListView = wrapper.find('SwipeListView');
        swipeListView.props().onRightAction('0', {});    
        expect(mockSetTags).toHaveBeenCalledWith(['2','3']);
      });
    });
  