import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import FdisQuality from './app/FdisQuality';
import SplashScreen from './app/screens/SplashScreen';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <GluestackUIProvider config={config}>
        <SplashScreen />
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider config={config}>
      <View style={{ flex: 1 }}>
        <FdisQuality />
      </View>
    </GluestackUIProvider>
  );
};

export default App;
