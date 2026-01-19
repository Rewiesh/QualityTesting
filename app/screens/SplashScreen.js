/* eslint-disable prettier/prettier */
import React from 'react';
import { Dimensions } from 'react-native';
import { Box, Text, Spinner, VStack } from '@gluestack-ui/themed';
import { Image } from 'react-native';

const SplashScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <Box flex={1} bg="$white" alignItems="center" justifyContent="center">
      <Image
        source={require('../assets/images/logo/image_login.jpg')}
        resizeMode="contain"
        style={{
          width: screenWidth,
          height: screenHeight,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <VStack
        position="absolute"
        bottom={150}
        alignItems="center"
        space="md"
        zIndex={1}
      >
        <Spinner size="large" color="$amber500" />
        <Text fontSize="$md" fontWeight="$medium" color="$textLight600">
          Laden...
        </Text>
      </VStack>
    </Box>
  );
};

export default SplashScreen;
