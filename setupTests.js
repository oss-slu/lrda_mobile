import { NativeModules } from 'react-native';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// // Mock NativeModules
// jest.mock('NativeModules', () => ({
//   ...NativeModules,
//   UIManager: {
//     RCTView: () => {},
//   },
// }));
