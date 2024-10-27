import React from 'react';
import {Dimensions} from 'react-native';
import {
  Box,
  Text,
  Image,
  useColorModeValue,
  useTheme,
} from 'native-base';

const SplashScreen = () => {
  const screenWidth = Dimensions.get('window').width; 
  const screenHeight = Dimensions.get('window').height;
  
  return (
    <Box
      flex={1}
      bg={'white'}
      alignItems="center"
      justifyContent="center"
      padding={1}
      position="relative">
      <Image
        source={require('../assets/images/logo/image_login.jpg')}
        alt="Loading logo"
        resizeMode="contain"
        width={`${screenWidth}px`}
        height={`${screenHeight}px`}
        position="absolute"
        top={0}
        left={0}
      />
      <Text
        fontSize="xl"
        color="black"
        position="absolute"
        bottom="175px"
        zIndex={1}>
        Laden...
      </Text>
    </Box>
  );
};

export default SplashScreen;
