/* eslint-disable prettier/prettier */
import React, { useCallback } from 'react';
import { Box, Text, Button, Modal, HStack, Center, Icon, Image, VStack, Pressable } from 'native-base';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
      <Modal.Content maxWidth="400px" rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg={`${iconColor}.100`} size="8" rounded="lg">
              <Icon as={MaterialIcons} name="add-a-photo" size="sm" color={`${iconColor}.600`} />
            </Center>
            <Text fontSize="md" fontWeight="bold">{title}</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <VStack space={3}>
            <Pressable onPress={handleTakePhoto}>
              {({ isPressed }) => (
                <HStack
                  alignItems="center"
                  space={3}
                  bg={isPressed ? 'gray.100' : 'gray.50'}
                  p="4"
                  rounded="xl"
                >
                  <Center bg="blue.100" size="12" rounded="xl">
                    <Icon as={MaterialIcons} name="camera-alt" size="md" color="blue.600" />
                  </Center>
                  <VStack>
                    <Text fontSize="sm" fontWeight="bold" color="coolGray.800">Maak een foto</Text>
                    <Text fontSize="xs" color="gray.500">Gebruik de camera</Text>
                  </VStack>
                </HStack>
              )}
            </Pressable>

            <Pressable onPress={handleSelectFromGallery}>
              {({ isPressed }) => (
                <HStack
                  alignItems="center"
                  space={3}
                  bg={isPressed ? 'gray.100' : 'gray.50'}
                  p="4"
                  rounded="xl"
                >
                  <Center bg="green.100" size="12" rounded="xl">
                    <Icon as={MaterialIcons} name="photo-library" size="md" color="green.600" />
                  </Center>
                  <VStack>
                    <Text fontSize="sm" fontWeight="bold" color="coolGray.800">Kies uit galerij</Text>
                    <Text fontSize="xs" color="gray.500">Selecteer bestaande foto</Text>
                  </VStack>
                </HStack>
              )}
            </Pressable>

            {currentImage && (
              <VStack space={3} mt="2">
                <Box rounded="xl" overflow="hidden" borderWidth={1} borderColor="gray.200">
                  <Image
                    source={{ uri: currentImage }}
                    alt="Geselecteerde afbeelding"
                    h="48"
                    w="100%"
                    resizeMode="cover"
                  />
                </Box>

                <HStack space={2}>
                  <Button
                    flex={1}
                    variant="outline"
                    borderColor="red.300"
                    _text={{ color: 'red.500' }}
                    rounded="xl"
                    leftIcon={<Icon as={MaterialIcons} name="delete" size="sm" color="red.500" />}
                    onPress={onDeleteImage}
                  >
                    Verwijderen
                  </Button>
                  <Button
                    flex={1}
                    bg="fdis.500"
                    _pressed={{ bg: 'fdis.600' }}
                    rounded="xl"
                    leftIcon={<Icon as={MaterialIcons} name="save" size="sm" color="white" />}
                    onPress={() => {
                      onSaveError();
                      onClose();
                    }}
                  >
                    Opslaan
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default React.memo(ImagePickerModal);
