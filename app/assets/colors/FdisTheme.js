import {extendTheme} from 'native-base';

// Correctly formatted custom color definitions for the theme.
const customColors = {
  // Custom color palette
  fdis: {
    10: '#fff',
    50: '#9adaff',
    100: '#72cbff',
    200: '#4abdff',
    300: '#23aeff',
    400: '#00a0fa',
    500: '#078edc',
    600: '#0c7dbf',
    700: '#106da3',
    800: '#135e89',
    900: '#144e70',
    1000: '#ffffff', // A lighter background for light mode
    1100: '#333940', // A darker, blue-gray color suitable for dark mode
  },
  bgLight: '#ffffff', // A lighter background for light mode
  bgDark: '#333940', // A darker, blue-gray color suitable for dark mode
};

const FdisTheme = extendTheme({
  colors: {
    ...customColors,
  },
  config: {
    initialColorMode: 'light', // Set the initial color mode.
    useSystemColorMode: false, // Use the system color mode settings.
  },
});

export default FdisTheme;
