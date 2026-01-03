/* eslint-disable prettier/prettier */
/**
 * Design tokens for consistent UI across the app
 */

// Spacing values (NativeBase spacing scale)
export const SPACING = {
  xs: '1',
  sm: '2',
  md: '3',
  lg: '4',
  xl: '5',
  xxl: '6',
  card: '3',
  section: '4',
  screen: '4',
};

// Border radius values
export const RADIUS = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
  xl: '2xl',
  card: 'xl',
  button: 'xl',
  input: 'lg',
  icon: 'md',
};

// Icon sizes
export const ICON_SIZE = {
  xs: '2xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
  xl: 'lg',
  cardHeader: 6,
  cardHeaderSmall: 5,
  button: 'sm',
  listItem: 'md',
};

// Font sizes
export const FONT_SIZE = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  cardTitle: 'sm',
  cardLabel: 'xs',
  button: 'sm',
};

// Shadow values
export const SHADOW = {
  none: 0,
  sm: 1,
  md: 2,
  lg: 3,
  card: 1,
};

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// FlatList optimization settings
export const FLATLIST_CONFIG = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 5,
  removeClippedSubviews: true,
  updateCellsBatchingPeriod: 50,
};

export default {
  SPACING,
  RADIUS,
  ICON_SIZE,
  FONT_SIZE,
  SHADOW,
  ANIMATION,
  FLATLIST_CONFIG,
};
