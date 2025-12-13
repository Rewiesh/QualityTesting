/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Icon, TextArea, Image, Pressable, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LogBookSection = ({
  error,
  onLogBookChange,
  onOpenImagePicker,
  onDeleteImage,
  cardBg,
}) => {
  return (
    <Box bg={cardBg} rounded="2xl" shadow={1} p="4" mb="3">
      <HStack alignItems="center" justifyContent="space-between" mb="3">
        <HStack alignItems="center" space={2}>
          <Center bg="purple.100" size="8" rounded="lg">
            <Icon as={MaterialIcons} name="book" size="sm" color="purple.600" />
          </Center>
          <Text fontSize="md" fontWeight="bold" color="coolGray.800">
            Opmerking Element
          </Text>
        </HStack>
        <Pressable onPress={onOpenImagePicker}>
          {({ isPressed }) => (
            <Center
              bg={isPressed ? 'purple.200' : 'purple.100'}
              size="10"
              rounded="lg"
              style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
            >
              <Icon as={MaterialIcons} name="add-a-photo" size="sm" color="purple.600" />
            </Center>
          )}
        </Pressable>
      </HStack>

      <TextArea
        placeholder="Plaats hier uw opmerking..."
        value={error.LogBook}
        onChangeText={onLogBookChange}
        bg="gray.50"
        borderWidth={0}
        rounded="xl"
        fontSize="sm"
        h="20"
        mb="2"
      />

      {error.LogBookImg && (
        <VStack space={2} mt="2">
          <Box rounded="xl" overflow="hidden" borderWidth={1} borderColor="gray.200">
            <Image
              source={{ uri: error.LogBookImg }}
              alt="Logboek afbeelding"
              h="40"
              w="100%"
              resizeMode="cover"
            />
          </Box>
          <Pressable onPress={onDeleteImage}>
            {({ isPressed }) => (
              <HStack
                alignItems="center"
                justifyContent="center"
                space={2}
                bg={isPressed ? 'red.100' : 'red.50'}
                py="2"
                rounded="xl"
              >
                <Icon as={MaterialIcons} name="delete" size="sm" color="red.500" />
                <Text fontSize="sm" color="red.500">Verwijder afbeelding</Text>
              </HStack>
            )}
          </Pressable>
        </VStack>
      )}
    </Box>
  );
};

export default React.memo(LogBookSection);
