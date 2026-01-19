/* eslint-disable prettier/prettier */
import React from "react";
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
  Button,
  ButtonText,
  ButtonIcon,
  HStack,
  VStack,
  Center,
  Icon,
  CloseIcon,
  Textarea,
  TextareaInput,
} from "@gluestack-ui/themed";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

export const RemarkModal = ({ isOpen, onClose, value, btnColor }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent borderRadius="$2xl">
        <ModalCloseButton>
          <Icon as={CloseIcon} />
        </ModalCloseButton>
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg="$orange100" w="$8" h="$8" borderRadius="$lg">
              <MIcon name="edit-note" size={16} color="#ea580c" />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">Opmerkingen</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Textarea bg="$backgroundLight100" borderWidth={0} borderRadius="$xl" h={80}>
            <TextareaInput
              placeholder="Type hier uw opmerking..."
              value={value}
              fontSize="$sm"
            />
          </Textarea>
        </ModalBody>
        <ModalFooter borderTopWidth={0}>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            borderRadius="$xl"
          >
            <ButtonText color="$textLight600">Sluiten</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const UploadModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent borderRadius="$2xl">
        <ModalCloseButton>
          <Icon as={CloseIcon} />
        </ModalCloseButton>
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg="$orange100" w="$8" h="$8" borderRadius="$lg">
              <MIcon name="warning" size={16} color="#ea580c" />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">Waarschuwing</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Text color="$textLight600">
            Het vereiste aantal elementen komt niet overeen met uw telling. Weet
            u zeker dat u deze audit wilt uploaden?
          </Text>
        </ModalBody>
        <ModalFooter borderTopWidth={0} gap="$2">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            borderRadius="$xl"
          >
            <ButtonText color="$textLight600">Annuleer</ButtonText>
          </Button>
          <Button
            onPress={onConfirm}
            bg="$amber500"
            borderRadius="$xl"
            sx={{ ":active": { bg: "$amber600" } }}
          >
            <ButtonText color="$white">Doorgaan</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const UploadErrorDialog = ({ visible, info, onRetry, onClose }) => {
  return (
    <Modal isOpen={visible} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent borderRadius="$2xl">
        <ModalCloseButton>
          <Icon as={CloseIcon} />
        </ModalCloseButton>
        <ModalHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg="$red100" w="$8" h="$8" borderRadius="$lg">
              <MIcon name="error" size={16} color="#dc2626" />
            </Center>
            <Text fontSize="$md" fontWeight="$bold">Upload Fout</Text>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <Box bg="$red50" p="$3" borderRadius="$xl">
            <Text color="$red700" fontSize="$sm">
              {info?.message || "Er is een fout opgetreden tijdens het uploaden."}
            </Text>
          </Box>
        </ModalBody>
        <ModalFooter borderTopWidth={0} gap="$2">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            borderRadius="$xl"
          >
            <ButtonText color="$textLight600">Sluiten</ButtonText>
          </Button>
          <Button
            onPress={onRetry}
            bg="$amber500"
            borderRadius="$xl"
            sx={{ ":active": { bg: "$amber600" } }}
          >
            <MIcon name="refresh" size={16} color="#fff" />
            <ButtonText color="$white" ml="$1">Opnieuw</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
