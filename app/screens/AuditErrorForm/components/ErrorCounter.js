/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Icon, Pressable } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ErrorCounter = ({ count, setCount, cardBg }) => {
  return (
    <Box bg={cardBg} rounded="2xl" shadow={1} p="4" mb="3">
      <HStack alignItems="center" space={2} mb="3">
        <Center bg="orange.100" size="8" rounded="lg">
          <Icon as={MaterialIcons} name="pin" size="sm" color="orange.600" />
        </Center>
        <Text fontSize="md" fontWeight="bold" color="coolGray.800">
          Aantal fouten
        </Text>
      </HStack>
      
      <HStack space={4} justifyContent="center" alignItems="center">
        <Pressable
          onPress={() => setCount(prev => (prev > 0 ? prev - 1 : 0))}
        >
          {({ isPressed }) => (
            <Center
              bg={isPressed ? 'red.200' : 'red.100'}
              size="14"
              rounded="xl"
              style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
            >
              <Icon as={MaterialIcons} name="remove" size="lg" color="red.600" />
            </Center>
          )}
        </Pressable>

        <Center bg="gray.100" px="8" py="3" rounded="xl" minW="20">
          <Text fontSize="2xl" fontWeight="bold" color="coolGray.800">
            {count}
          </Text>
        </Center>

        <Pressable
          onPress={() => setCount(prev => prev + 1)}
        >
          {({ isPressed }) => (
            <Center
              bg={isPressed ? 'green.200' : 'green.100'}
              size="14"
              rounded="xl"
              style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
            >
              <Icon as={MaterialIcons} name="add" size="lg" color="green.600" />
            </Center>
          )}
        </Pressable>
      </HStack>
    </Box>
  );
};

export default React.memo(ErrorCounter);
