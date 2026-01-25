import React, {useState, useEffect} from 'react';
import {NativeBaseProvider, Box} from 'native-base';
import {View, StatusBar} from 'react-native';
import FdisQuality from './app/FdisQuality';
import SplashScreen from './app/screens/SplashScreen';
import FdisTheme from './app/assets/colors/FdisTheme';
import * as database from './app/services/database/database1';
import userManager from './app/services/UserManager';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Check if user is logged in
        const isLoggedIn = await userManager.isLoggedIn();
        
        if (isLoggedIn) {
          // Initialize database tables (creates tb_remark if missing)
          await database.InitializeDatabase();
          console.log('Database initialized for logged-in user');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        // Show splash for minimum 1.5 seconds
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };

    initApp();
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
