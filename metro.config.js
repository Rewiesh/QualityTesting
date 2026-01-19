const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      // Workaround for @react-native-picker/picker MacOS/Windows issue
      // Handle both relative (./PickerWindows) and absolute paths
      if (moduleName.endsWith('PickerMacOS') || moduleName.endsWith('PickerWindows')) {
        // Return empty module to skip these platform-specific imports
        return {
          filePath: path.resolve(__dirname, 'node_modules/@react-native-picker/picker/js/PickerAndroid.js'),
          type: 'sourceFile',
        };
      }
      // Default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
