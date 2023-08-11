import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { NativeModules } from 'react-native';

// Set up enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// Mock NativeModules
jest.mock('NativeModules', () => ({
  ...NativeModules,
  UIManager: {
    RCTView: () => {},
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
