/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Alert } from 'react-native';
import {
  Box,
  Button,
  Icon,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  Center,
  useColorModeValue,
  Modal,
  Input,
} from 'native-base';
import { ShowToast } from '../services/Util';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';

const AuditPersonList = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { AuditId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [nameClient, setNameClient] = useState('');
  const [changingClient, setChangingClient] = useState(null);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

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
        <Button
          onPress={() => setModalVisible(true)}
          startIcon={
            <Icon as={MaterialIcons} name="add" size="xl" color="white" />
          }
          variant="ghost"
          _pressed={{
            bg: "white:alpha.20",
          }}
          _text={{
            color: 'white',
            fontSize: 'md',
          }}
          px="3"
          py="2"
          accessibilityLabel="Add Person"></Button>
      ),
    });
  };

  const renderPresentClientRow = useCallback(({ item }) => (
    <Pressable onPress={() => editClient(item)}>
      {({ isPressed }) => (
        <Box
          bg={cardBg}
          mx="4"
          my="1.5"
          rounded="2xl"
          shadow={1}
          overflow="hidden"
          style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
        >
          <HStack alignItems="center" p="4">
            <Center bg="blue.100" size="12" rounded="xl" mr="3">
              <Icon as={MaterialIcons} name="person" size="md" color="blue.600" />
            </Center>
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                {item.name}
              </Text>
            </VStack>
            <HStack space={2}>
              <Pressable onPress={() => deletePresentClient(item)}>
                {({ isPressed: delPressed }) => (
                  <Center
                    bg={delPressed ? 'red.100' : 'red.50'}
                    size="10"
                    rounded="xl"
                  >
                    <Icon as={MaterialIcons} name="delete" size="sm" color="red.500" />
                  </Center>
                )}
              </Pressable>
              <Center bg="gray.100" size="10" rounded="xl">
                <Icon as={MaterialIcons} name="edit" size="sm" color="gray.500" />
              </Center>
            </HStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  ), [cardBg, editClient, deletePresentClient]);

  const renderEmptyState = useCallback(() => (
    <Center flex={1} py="20">
      <Center bg="blue.100" size="20" rounded="full" mb="4">
        <Icon as={MaterialIcons} name="people" size="4xl" color="blue.500" />
      </Center>
      <Text fontSize="lg" fontWeight="bold" color="coolGray.700" mb="1">
        Geen aanwezigen
      </Text>
      <Text fontSize="sm" color="gray.500" textAlign="center" px="8" mb="4">
        Voeg personen toe die aanwezig zijn bij deze audit.
      </Text>
      <Button
        bg="fdis.500"
        _pressed={{ bg: 'fdis.600' }}
        rounded="xl"
        leftIcon={<Icon as={MaterialIcons} name="person-add" size="sm" color="white" />}
        onPress={() => setModalVisible(true)}
      >
        Persoon Toevoegen
      </Button>
    </Center>
  ), []);

  const renderHeader = useCallback(() => (
    clients.length > 0 ? (
      <HStack px="4" py="3" alignItems="center" justifyContent="space-between">
        <Text fontSize="sm" color="gray.500">
          Aanwezige personen
        </Text>
        <Box bg="blue.100" px="3" py="1" rounded="full">
          <Text fontSize="xs" fontWeight="bold" color="blue.600">
            {clients.length} persoon/personen
          </Text>
        </Box>
      </HStack>
    ) : null
  ), [clients.length]);

  return (
    <Box flex={1} bg={bgMain}>
      <FlatList
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
    <Modal.Content maxWidth="400px" rounded="2xl">
      <Modal.CloseButton />
      <Modal.Header borderBottomWidth={0}>
        <HStack alignItems="center" space={2}>
          <Center bg="blue.100" size="8" rounded="lg">
            <Icon as={MaterialIcons} name={isEditing ? 'edit' : 'person-add'} size="sm" color="blue.600" />
          </Center>
          <Text fontWeight="bold">{isEditing ? 'Persoon Wijzigen' : 'Persoon Toevoegen'}</Text>
        </HStack>
      </Modal.Header>
      <Modal.Body>
        <Input
          placeholder="Type hier de naam in..."
          value={value}
          onChangeText={onChangeText}
          bg="gray.50"
          borderWidth={0}
          rounded="xl"
          fontSize="md"
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
            onPress={onClose}
          >
            Annuleren
          </Button>
          <Button
            flex={1}
            bg="fdis.500"
            _pressed={{ bg: 'fdis.600' }}
            rounded="xl"
            onPress={save}
            isDisabled={!value.trim()}
          >
            Opslaan
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal.Content>
  </Modal>
);

export default AuditPersonList;
