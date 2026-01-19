/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Alert, FlatList as RNFlatList } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Button,
  ButtonText,
  HStack,
  Text,
  Pressable,
  VStack,
  Center,
  Input,
  InputField,
  Icon,
  CloseIcon,
} from '@gluestack-ui/themed';
import { ShowToast } from '../services/Util';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const AuditPersonList = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { AuditId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [nameClient, setNameClient] = useState('');
  const [changingClient, setChangingClient] = useState(null);

  useEffect(() => {
    if (isFocused) {
      renderAddPersonButton();
      fetchClients();
    }
  }, [isFocused, fetchClients]);

  const fetchClients = useCallback(() => {
    database
      .getAllPresentClient(AuditId)
      .then(fetchedClients => setClients(fetchedClients))
      .catch(error => {
        logError('Failed to fetch clients:', error);
        Alert.alert('Failed to load clients.', error.message);
      });
  }, [AuditId]);

  const saveClient = useCallback(() => {
    const promise = changingClient
      ? database.updatePresentClient(changingClient.id, nameClient)
      : database.savePresentClient(nameClient, AuditId);

    promise
      .then(() => {
        setModalVisible(false);
        setNameClient('');
        setChangingClient(null);
        return database.setAuditUnsaved(AuditId, true);
      })
      .then(fetchClients)
      .catch(error => {
        logError('Error saving client:', error);
        Alert.alert('Error', error.message);
      });
  }, [changingClient, nameClient, AuditId, fetchClients]);

  const editClient = useCallback((client) => {
    setModalVisible(true);
    setChangingClient(client);
    setNameClient(client.name);
  }, []);

  const deletePresentClient = useCallback((client) => {
    Alert.alert(
      'Bevestig Verwijdering',
      'Weet u zeker dat u deze klant wilt verwijderen?',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          onPress: async () => {
            try {
              setClients(currentClients =>
                currentClients.filter(c => c.id !== client.id),
              );
              await database.deletePresentClient(client.id);
              await database.setAuditUnsaved(AuditId, true);
              ShowToast({
                status: 'success',
                message: 'Klant succesvol verwijderd.',
              });
            } catch (error) {
              logError('Error deleting client:', error);
              ShowToast({
                status: 'error',
                message: 'Fout bij het verwijderen van de klant.',
              });
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  }, [AuditId]);

  const renderAddPersonButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <MIcon name="add" size={24} color="#fff" />
        </Pressable>
      ),
    });
  };

  const renderPresentClientRow = useCallback(({ item }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [delPressed, setDelPressed] = useState(false);

    return (
      <Pressable
        onPress={() => editClient(item)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <Box
          bg="$white"
          mx="$4"
          my="$1.5"
          borderRadius="$2xl"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={2}
          overflow="hidden"
          style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
        >
          <HStack alignItems="center" p="$4">
            <Center bg="$blue100" w="$12" h="$12" borderRadius="$xl" mr="$3">
              <MIcon name="person" size={20} color="#2563eb" />
            </Center>
            <VStack flex={1}>
              <Text fontSize="$md" fontWeight="$bold" color="$textDark800">
                {item.name}
              </Text>
            </VStack>
            <HStack space="sm">
              <Pressable
                onPress={() => deletePresentClient(item)}
                onPressIn={() => setDelPressed(true)}
                onPressOut={() => setDelPressed(false)}
              >
                <Center
                  bg={delPressed ? '$red100' : '$red50'}
                  w="$10"
                  h="$10"
                  borderRadius="$xl"
                >
                  <MIcon name="delete" size={16} color="#ef4444" />
                </Center>
              </Pressable>
              <Center bg="$backgroundLight200" w="$10" h="$10" borderRadius="$xl">
                <MIcon name="edit" size={16} color="#6b7280" />
              </Center>
            </HStack>
          </HStack>
        </Box>
      </Pressable>
    );
  }, [editClient, deletePresentClient]);

  const renderEmptyState = useCallback(() => (
    <Center flex={1} py="$20">
      <Center bg="$blue100" w="$20" h="$20" borderRadius="$full" mb="$4">
        <MIcon name="people" size={48} color="#3b82f6" />
      </Center>
      <Text fontSize="$lg" fontWeight="$bold" color="$textDark700" mb="$1">
        Geen aanwezigen
      </Text>
      <Text fontSize="$sm" color="$textLight500" textAlign="center" px="$8" mb="$4">
        Voeg personen toe die aanwezig zijn bij deze audit.
      </Text>
      <Button
        bg="$amber500"
        borderRadius="$xl"
        sx={{ ":active": { bg: "$amber600" } }}
        onPress={() => setModalVisible(true)}
      >
        <MIcon name="person-add" size={16} color="#fff" />
        <ButtonText color="$white" ml="$1">Persoon Toevoegen</ButtonText>
      </Button>
    </Center>
  ), []);

  const renderHeader = useCallback(() => (
    clients.length > 0 ? (
      <HStack px="$4" py="$3" alignItems="center" justifyContent="space-between">
        <Text fontSize="$sm" color="$textLight500">
          Aanwezige personen
        </Text>
        <Box bg="$blue100" px="$3" py="$1" borderRadius="$full">
          <Text fontSize="$xs" fontWeight="$bold" color="$blue600">
            {clients.length} persoon/personen
          </Text>
        </Box>
      </HStack>
    ) : null
  ), [clients.length]);

  return (
    <Box flex={1} bg="$backgroundLight100">
      <RNFlatList
        data={clients}
        renderItem={renderPresentClientRow}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        {...FLATLIST_CONFIG}
      />
      <RenderClientModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        value={nameClient}
        onChangeText={setNameClient}
        save={saveClient}
        isEditing={!!changingClient}
      />
    </Box>
  );
};

const RenderClientModal = ({
  isOpen,
  onClose,
  value,
  onChangeText,
  save,
  isEditing,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalBackdrop />
    <ModalContent maxWidth={400} borderRadius="$2xl">
      <ModalCloseButton>
        <Icon as={CloseIcon} />
      </ModalCloseButton>
      <ModalHeader borderBottomWidth={0}>
        <HStack alignItems="center" space="sm">
          <Center bg="$blue100" w="$8" h="$8" borderRadius="$lg">
            <MIcon name={isEditing ? 'edit' : 'person-add'} size={16} color="#2563eb" />
          </Center>
          <Text fontWeight="$bold">{isEditing ? 'Persoon Wijzigen' : 'Persoon Toevoegen'}</Text>
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
            placeholder="Type hier de naam in..."
            value={value}
            onChangeText={onChangeText}
            fontSize="$md"
          />
        </Input>
      </ModalBody>
      <ModalFooter borderTopWidth={0} pt="$0" gap="$2">
        <Button
          flex={1}
          variant="outline"
          borderColor="$borderLight300"
          borderRadius="$xl"
          onPress={onClose}
        >
          <ButtonText color="$textLight600">Annuleren</ButtonText>
        </Button>
        <Button
          flex={1}
          bg="$amber500"
          borderRadius="$xl"
          sx={{ ":active": { bg: "$amber600" } }}
          onPress={save}
          isDisabled={!value.trim()}
        >
          <ButtonText color="$white">Opslaan</ButtonText>
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default AuditPersonList;
