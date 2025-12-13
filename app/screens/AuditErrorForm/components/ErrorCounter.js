/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { Box, Text, HStack, Center, Icon, Pressable, Input, Modal, Button, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ErrorCounter = ({ count, setCount, cardBg }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleOpenModal = useCallback(() => {
    setInputValue(count.toString());
    setModalVisible(true);
  }, [count]);

  const handleConfirmInput = useCallback(() => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 0) {
      setCount(num);
    }
    setModalVisible(false);
  }, [inputValue, setCount]);

  return (
    <Box bg={cardBg} rounded="xl" shadow={1} px="3" py="2" mb="2">
      <HStack alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" space={2}>
          <Center bg="orange.100" size="6" rounded="md">
            <Icon as={MaterialIcons} name="pin" size="xs" color="orange.600" />
          </Center>
          <Text fontSize="sm" fontWeight="bold" color="coolGray.800">
            Aantal fouten
          </Text>
        </HStack>
        
        {/* Inline counter */}
        <HStack space={2} alignItems="center">
          <Pressable onPress={() => setCount(prev => (prev > 0 ? prev - 1 : 0))}>
            {({ isPressed }) => (
              <Center
                bg={isPressed ? 'red.200' : 'red.100'}
                size="8"
                rounded="lg"
              >
                <Icon as={MaterialIcons} name="remove" size="sm" color="red.600" />
              </Center>
            )}
          </Pressable>

          <Pressable onPress={handleOpenModal}>
            {({ isPressed }) => (
              <Center 
                bg={isPressed ? 'gray.200' : 'gray.100'} 
                px="4" 
                py="1" 
                rounded="lg" 
                minW="12"
              >
                <Text fontSize="lg" fontWeight="bold" color="coolGray.800">
                  {count}
                </Text>
              </Center>
            )}
          </Pressable>

          <Pressable onPress={() => setCount(prev => prev + 1)}>
            {({ isPressed }) => (
              <Center
                bg={isPressed ? 'green.200' : 'green.100'}
                size="8"
                rounded="lg"
              >
                <Icon as={MaterialIcons} name="add" size="sm" color="green.600" />
              </Center>
            )}
          </Pressable>
        </HStack>
      </HStack>

      {/* Manual input modal */}
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <Modal.Content maxWidth="300px" rounded="2xl">
          <Modal.CloseButton />
          <Modal.Header borderBottomWidth={0}>
            <HStack alignItems="center" space={2}>
              <Center bg="orange.100" size="8" rounded="lg">
                <Icon as={MaterialIcons} name="edit" size="sm" color="orange.600" />
              </Center>
              <Text fontWeight="bold">Aantal invoeren</Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <Input
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder="Voer aantal in"
              bg="gray.50"
              borderWidth={0}
              rounded="xl"
              fontSize="xl"
              textAlign="center"
              py="3"
            />
          </Modal.Body>
          <Modal.Footer borderTopWidth={0} pt="0">
            <HStack space={2} flex={1}>
              <Button
                flex={1}
                variant="outline"
                borderColor="gray.300"
                rounded="xl"
                onPress={() => setModalVisible(false)}
              >
                Annuleren
              </Button>
              <Button
                flex={1}
                bg="fdis.500"
                _pressed={{ bg: 'fdis.600' }}
                rounded="xl"
                onPress={handleConfirmInput}
              >
                Bevestigen
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default React.memo(ErrorCounter);
