/* eslint-disable prettier/prettier */
/**
 * Enhanced RefreshControl with better feedback
 */
import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';
import { useColorModeValue, useTheme } from 'native-base';

const RefreshControl = ({ 
  refreshing, 
  onRefresh, 
  title = 'Aan het vernieuwen...',
  ...props 
}) => {
  const theme = useTheme();
  const tintColor = theme.colors.fdis[500];
  const titleColor = useColorModeValue('#666', '#aaa');
  const backgroundColor = useColorModeValue('#f5f5f5', '#1a1a1a');

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      titleColor={titleColor}
      title={refreshing ? title : 'Trek om te vernieuwen'}
      colors={[tintColor]} // Android
      progressBackgroundColor={backgroundColor} // Android
      {...props}
    />
  );
};

export default RefreshControl;
