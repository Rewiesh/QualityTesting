import React, {useState, useEffect} from 'react';
import {NativeBaseProvider, Box} from 'native-base';
import {View, StatusBar} from 'react-native';
import FdisQuality from './app/FdisQuality';
import SplashScreen from './app/screens/SplashScreen';
import FdisTheme from './app/assets/colors/FdisTheme';
// import FdisTheme from './app/assets/colors/FdisTheme';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  if (isLoading) {
    return (
      <NativeBaseProvider theme={FdisTheme}>
        <SplashScreen />
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider theme={FdisTheme}>
      <View style={{flex: 1}}>
        <FdisQuality />
      </View>
    </NativeBaseProvider>
  );
};

export default App;
