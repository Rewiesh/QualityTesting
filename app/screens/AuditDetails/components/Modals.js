/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { Box, Text, Button, Modal, FormControl, TextArea, Icon, HStack, VStack, Center } from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export const RemarkModal = ({ isOpen, onClose, value, btnColor }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg="orange.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="edit-note" size="sm" color="orange.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold">Opmerkingen</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <FormControl>
            <TextArea
              placeholder="Type hier uw opmerking..."
              value={value}
              h={20}
              bg="gray.50"
              borderWidth={0}
              rounded="xl"
              fontSize="sm"
            />
          </FormControl>
        </Modal.Body>
        <Modal.Footer borderTopWidth={0}>
          <Button.Group space={2}>
            <Button 
              variant="ghost" 
              onPress={onClose}
              rounded="xl"
              _text={{ color: "gray.600" }}
            >
              Sluiten
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export const UploadModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg="orange.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="warning" size="sm" color="orange.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold">Waarschuwing</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <Text color="gray.600">
            Het vereiste aantal elementen komt niet overeen met uw telling. Weet
            u zeker dat u deze audit wilt uploaden?
          </Text>
        </Modal.Body>
        <Modal.Footer borderTopWidth={0}>
          <Button.Group space={2}>
            <Button 
              variant="ghost" 
              onPress={onClose}
              rounded="xl"
              _text={{ color: "gray.600" }}
            >
              Annuleer
            </Button>
            <Button 
              onPress={onConfirm} 
              bg="fdis.500"
              _pressed={{ bg: "fdis.600" }}
              rounded="xl"
            >
              Doorgaan
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export const UploadErrorDialog = ({ visible, info, onRetry, onClose }) => {
  return (
    <Modal isOpen={visible} onClose={onClose} size="lg">
      <Modal.Content rounded="2xl">
        <Modal.CloseButton />
        <Modal.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg="red.100" size="8" rounded="lg">
              <Icon as={MaterialIcons} name="error" size="sm" color="red.600" />
            </Center>
            <Text fontSize="md" fontWeight="bold">Upload Fout</Text>
          </HStack>
        </Modal.Header>
        <Modal.Body>
          <Box bg="red.50" p="3" rounded="xl">
            <Text color="red.700" fontSize="sm">
              {info?.message || "Er is een fout opgetreden tijdens het uploaden."}
            </Text>
          </Box>
        </Modal.Body>
        <Modal.Footer borderTopWidth={0}>
          <Button.Group space={2}>
            <Button 
              variant="ghost" 
              onPress={onClose}
              rounded="xl"
              _text={{ color: "gray.600" }}
            >
              Sluiten
            </Button>
            <Button 
              onPress={onRetry}
              bg="fdis.500"
              _pressed={{ bg: "fdis.600" }}
              rounded="xl"
              leftIcon={<Icon as={MaterialIcons} name="refresh" size="sm" color="white" />}
            >
              Opnieuw
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
