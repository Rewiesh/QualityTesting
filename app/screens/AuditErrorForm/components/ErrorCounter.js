/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Text,
  HStack,
  VStack,
  Center,
  Icon,
  CloseIcon,
  Pressable,
  Input,
  InputField,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const ErrorCounter = ({ count, setCount, cardBg }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [minusPressed, setMinusPressed] = useState(false);
  const [numPressed, setNumPressed] = useState(false);
  const [plusPressed, setPlusPressed] = useState(false);

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
    <Box bg={cardBg || '$white'} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} px="$3" py="$2" mb="$2">
      <HStack alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" space="sm">
          <Center bg="$orange100" w="$6" h="$6" borderRadius="$md">
            <MIcon name="pin" size={12} color="#ea580c" />
          </Center>
          <Text fontSize="$sm" fontWeight="$bold" color="$textDark800">
            Aantal fouten
          </Text>
        </HStack>

        {/* Inline counter */}
        <HStack space="sm" alignItems="center">
          <Pressable
            onPress={() => setCount(prev => (prev > 0 ? prev - 1 : 0))}
            onPressIn={() => setMinusPressed(true)}
            onPressOut={() => setMinusPressed(false)}
          >
            <Center
              bg={minusPressed ? '$red200' : '$red100'}
              w="$8"
              h="$8"
              borderRadius="$lg"
            >
              <MIcon name="remove" size={16} color="#dc2626" />
            </Center>
          </Pressable>

          <Pressable
            onPress={handleOpenModal}
            onPressIn={() => setNumPressed(true)}
            onPressOut={() => setNumPressed(false)}
          >
            <Center
              bg={numPressed ? '$backgroundLight300' : '$backgroundLight200'}
              px="$4"
              py="$1"
              borderRadius="$lg"
              minWidth={48}
            >
              <Text fontSize="$lg" fontWeight="$bold" color="$textDark800">
                {count}
              </Text>
            </Center>
          </Pressable>

          <Pressable
            onPress={() => setCount(prev => prev + 1)}
            onPressIn={() => setPlusPressed(true)}
            onPressOut={() => setPlusPressed(false)}
          >
            <Center
              bg={plusPressed ? '$green200' : '$green100'}
              w="$8"
              h="$8"
              borderRadius="$lg"
            >
              <MIcon name="add" size={16} color="#16a34a" />
            </Center>
          </Pressable>
        </HStack>
      </HStack>

      {/* Manual input modal */}
      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <ModalBackdrop />
        <ModalContent maxWidth={300} borderRadius="$2xl">
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
          <ModalHeader borderBottomWidth={0}>
            <HStack alignItems="center" space="sm">
              <Center bg="$orange100" w="$8" h="$8" borderRadius="$lg">
                <MIcon name="edit" size={16} color="#ea580c" />
              </Center>
              <Text fontWeight="$bold">Aantal invoeren</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <Input
              bg="$backgroundLight100"
              borderWidth={0}
              borderRadius="$xl"
              py="$3"
            >
              <InputField
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="number-pad"
                placeholder="Voer aantal in"
                fontSize="$xl"
                textAlign="center"
              />
            </Input>
          </ModalBody>
          <ModalFooter borderTopWidth={0} pt="$0" gap="$2">
            <Button
              flex={1}
              variant="outline"
              borderColor="$borderLight300"
              borderRadius="$xl"
              onPress={() => setModalVisible(false)}
            >
              <ButtonText color="$textLight600">Annuleren</ButtonText>
            </Button>
            <Button
              flex={1}
              bg="$amber500"
              borderRadius="$xl"
              sx={{ ":active": { bg: "$amber600" } }}
              onPress={handleConfirmInput}
            >
              <ButtonText color="$white">Bevestigen</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default React.memo(ErrorCounter);
