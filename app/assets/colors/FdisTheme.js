/**
 * FDIS Theme Configuration for Gluestack-UI
 * Custom color definitions for the app theme.
 */

// Custom FDIS color palette
export const fdisColors = {
  fdis: {
    10: '#fff',
    50: '#fef3c7',   // amber-100
    100: '#fde68a',  // amber-200
    200: '#fcd34d',  // amber-300
    300: '#fbbf24',  // amber-400
    400: '#f59e0b',  // amber-500 (primary)
    500: '#f59e0b',  // amber-500 (primary)
    600: '#d97706',  // amber-600
    700: '#b45309',  // amber-700
    800: '#92400e',  // amber-800
    900: '#78350f',  // amber-900
  },
  bgLight: '#ffffff',
  bgDark: '#1f2937',
};

// Theme configuration
export const themeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Export for backward compatibility
const FdisTheme = {
  colors: fdisColors,
  config: themeConfig,
};

export default FdisTheme;
