/* eslint-disable prettier/prettier */
import React from 'react';
import { Dimensions } from 'react-native';
import { Box, Text, Image, Spinner, VStack } from 'native-base';

const SplashScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <Box flex={1} bg="white" alignItems="center" justifyContent="center">
      <Image
        source={require('../assets/images/logo/image_login.jpg')}
        alt="Loading logo"
        resizeMode="contain"
        width={screenWidth}
        height={screenHeight}
        position="absolute"
        top={0}
        left={0}
      />
      <VStack
        position="absolute"
        bottom="150px"
        alignItems="center"
        space={3}
        zIndex={1}
      >
        <Spinner size="lg" color="fdis.500" />
        <Text fontSize="md" fontWeight="medium" color="coolGray.600">
          Laden...
        </Text>
      </VStack>
    </Box>
  );
};

export default SplashScreen;
