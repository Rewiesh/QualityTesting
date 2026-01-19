/* eslint-disable prettier/prettier */
/**
 * Enhanced RefreshControl with better feedback
 */
import React from 'react';
import { RefreshControl as RNRefreshControl } from 'react-native';

// FDIS amber color
const FDIS_COLOR = '#f59e0b';

const RefreshControl = ({ 
  refreshing, 
  onRefresh, 
  title = 'Aan het vernieuwen...',
  ...props 
}) => {
  const tintColor = FDIS_COLOR;
  const titleColor = '#666';
  const backgroundColor = '#f5f5f5';

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
