const reactNativeWebLite = require('react-native-web-lite');
const webpackFix = require('./webpack');

module.exports = Object.assign({}, reactNativeWebLite, { webpack: webpackFix });
