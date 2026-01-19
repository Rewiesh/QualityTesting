/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Textarea, TextareaInput, Pressable, VStack } from '@gluestack-ui/themed';
import { Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const LogBookSection = ({
  error,
  onLogBookChange,
  onOpenImagePicker,
  onDeleteImage,
  cardBg,
}) => {
  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$4" mb="$3">
      <HStack alignItems="center" justifyContent="space-between" mb="$3">
        <HStack alignItems="center" space="sm">
          <Center bg="$purple100" w="$8" h="$8" borderRadius="$lg">
            <MIcon name="book" size={16} color="#9333ea" />
          </Center>
          <Text fontSize="$md" fontWeight="$bold" color="$textDark800">
            Opmerking Element
          </Text>
        </HStack>
        <Pressable onPress={onOpenImagePicker}>
          {({ pressed }) => (
            <Center
              bg={pressed ? '$purple200' : '$purple100'}
              w="$10"
              h="$10"
              borderRadius="$lg"
              style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}
            >
              <MIcon name="add-a-photo" size={16} color="#9333ea" />
            </Center>
          )}
        </Pressable>
      </HStack>

      <Textarea
        bg="$backgroundLight50"
        borderWidth={0}
        borderRadius="$xl"
        h={80}
        mb="$2"
      >
        <TextareaInput
          placeholder="Plaats hier uw opmerking..."
          value={error.LogBook}
          onChangeText={onLogBookChange}
          fontSize="$sm"
        />
      </Textarea>

      {error.LogBookImg && (
        <VStack space="sm" mt="$2">
          <Box borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$borderLight200">
            <Image
              source={{ uri: error.LogBookImg }}
              style={{ height: 160, width: '100%' }}
              resizeMode="cover"
            />
          </Box>
          <Pressable onPress={onDeleteImage}>
            {({ pressed }) => (
              <HStack
                alignItems="center"
                justifyContent="center"
                space="sm"
                bg={pressed ? '$red100' : '$red50'}
                py="$2"
                borderRadius="$xl"
              >
                <MIcon name="delete" size={16} color="#ef4444" />
                <Text fontSize="$sm" color="$red500">Verwijder afbeelding</Text>
              </HStack>
            )}
          </Pressable>
        </VStack>
      )}
    </Box>
  );
};

export default React.memo(LogBookSection);
