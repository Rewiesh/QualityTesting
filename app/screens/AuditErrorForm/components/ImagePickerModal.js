/* eslint-disable prettier/prettier */
import React, { useCallback, useState } from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
  Button,
  ButtonText,
  HStack,
  VStack,
  Center,
  Icon,
  CloseIcon,
  Pressable,
  Image,
} from '@gluestack-ui/themed';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const ImagePickerModal = ({
  isOpen,
  onClose,
  title,
  currentImage,
  onSaveImage,
  onDeleteImage,
  onSaveError,
  iconColor = 'purple',
}) => {
  const [isPressed1, setIsPressed1] = useState(false);
  const [isPressed2, setIsPressed2] = useState(false);

  // Color mapping for iconColor prop
  const colorMap = {
    purple: { bg: '$purple100', icon: '#9333ea' },
    blue: { bg: '$blue100', icon: '#2563eb' },
    green: { bg: '$green100', icon: '#16a34a' },
    orange: { bg: '$orange100', icon: '#ea580c' },
  };
  const colors = colorMap[iconColor] || colorMap.purple;

  const handleTakePhoto = useCallback(async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.8,
    });
    if (result.assets?.length > 0) {
      onSaveImage(result.assets[0].uri);
    }
  }, [onSaveImage]);

  const handleSelectFromGallery = useCallback(async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      maxWidth: 1080,
      maxHeight: 1920,
      quality: 0.8,
    });
    if (result.assets?.length > 0) {
      onSaveImage(result.assets[0].uri);
    }
  }, [onSaveImage]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent maxWidth={400} borderRadius="$2xl">
        <ModalCloseButton>
          <Icon as={CloseIcon} />
        </ModalCloseButton>
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg={colors.bg} w="$8" h="$8" borderRadius="$lg">
              <MIcon name="add-a-photo" size={16} color={colors.icon} />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">{title}</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack space="md">
            <Pressable
              onPress={handleTakePhoto}
              onPressIn={() => setIsPressed1(true)}
              onPressOut={() => setIsPressed1(false)}
            >
              <HStack
                alignItems="center"
                space="md"
                bg={isPressed1 ? '$backgroundLight200' : '$backgroundLight100'}
                p="$4"
                borderRadius="$xl"
              >
                <Center bg="$blue100" w="$12" h="$12" borderRadius="$xl">
                  <MIcon name="camera-alt" size={20} color="#2563eb" />
                </Center>
                <VStack>
                  <Text fontSize="$sm" fontWeight="$bold" color="$textDark800">Maak een foto</Text>
                  <Text fontSize="$xs" color="$textLight500">Gebruik de camera</Text>
                </VStack>
              </HStack>
            </Pressable>

            <Pressable
              onPress={handleSelectFromGallery}
              onPressIn={() => setIsPressed2(true)}
              onPressOut={() => setIsPressed2(false)}
            >
              <HStack
                alignItems="center"
                space="md"
                bg={isPressed2 ? '$backgroundLight200' : '$backgroundLight100'}
                p="$4"
                borderRadius="$xl"
              >
                <Center bg="$green100" w="$12" h="$12" borderRadius="$xl">
                  <MIcon name="photo-library" size={20} color="#16a34a" />
                </Center>
                <VStack>
                  <Text fontSize="$sm" fontWeight="$bold" color="$textDark800">Kies uit galerij</Text>
                  <Text fontSize="$xs" color="$textLight500">Selecteer bestaande foto</Text>
                </VStack>
              </HStack>
            </Pressable>

            {currentImage && (
              <VStack space="md" mt="$2">
                <Box borderRadius="$xl" overflow="hidden" borderWidth={1} borderColor="$borderLight200">
                  <Image
                    source={{ uri: currentImage }}
                    alt="Geselecteerde afbeelding"
                    h={192}
                    w="$full"
                    resizeMode="cover"
                  />
                </Box>

                <HStack space="sm">
                  <Button
                    flex={1}
                    variant="outline"
                    borderColor="$red300"
                    borderRadius="$xl"
                    onPress={onDeleteImage}
                  >
                    <MIcon name="delete" size={16} color="#ef4444" />
                    <ButtonText color="$red500" ml="$1">Verwijderen</ButtonText>
                  </Button>
                  <Button
                    flex={1}
                    bg="$amber500"
                    borderRadius="$xl"
                    sx={{ ":active": { bg: "$amber600" } }}
                    onPress={() => {
                      onSaveError();
                      onClose();
                    }}
                  >
                    <MIcon name="save" size={16} color="#fff" />
                    <ButtonText color="$white" ml="$1">Opslaan</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(ImagePickerModal);
