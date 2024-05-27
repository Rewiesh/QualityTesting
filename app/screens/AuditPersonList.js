import React, {useState, useEffect, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {Alert} from 'react-native';
import {
  Box,
  Button,
  Icon,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  useTheme,
  useColorModeValue,
  Modal,
  Input,
  FormControl,
} from 'native-base';
import {ShowToast} from '../services/Util';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as database from '../services/database/database1';


const AuditPersonList = ({route, navigation}) => {
  const isFocused = useIsFocused();
  const theme = useTheme();
  const {AuditId} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [nameClient, setNameClient] = useState('');
  const [changingClient, setChangingClient] = useState(null);  

  const backgroundColor = useColorModeValue(
    'coolGray.50',
    theme.colors.fdis[1100],
  ); // Adjust for light and dark modes
  const cardBackgroundColor = useColorModeValue(
    'gray.100',
    theme.colors.fdis[900],
  );
  const headingTextColor = useColorModeValue('coolGray.800', 'black');
  const textColor = useColorModeValue('coolGray.800', 'black');
  const btnColor = useColorModeValue(
    theme.colors.fdis[400],
    theme.colors.fdis[600],
  );

  useEffect(() => {
    if (isFocused) {
      renderAddPersonButton();
      fetchClients();
      console.log('PresentClients : ' + JSON.stringify(clients));
    }
  }, [isFocused, fetchClients]);

  const fetchClients = useCallback(() => {
    database
      .getAllPresentClient(AuditId)
      .then(fetchedClients => setClients(fetchedClients))
      .catch(error => {
        console.error('Failed to fetch clients:', error);
        Alert.alert('Failed to load clients.', error.message);
      });
  }, [AuditId]);  

  const saveClient = () => {
    console.log('PresentClients : ' + JSON.stringify(clients));
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
        console.error('Error saving client:', error);
        Alert.alert('Error', error.message);
      });
  };  

  const editClient = client => {
    setModalVisible(true);
    setChangingClient(client);
    setNameClient(client.name);
  }; 

  const deletePresentClient = client => {
    Alert.alert(
      'Bevestig Verwijdering', 
      'Weet u zeker dat u deze klant wilt verwijderen?', 
      [
        {
          text: 'Annuleren', // Cancel
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'Verwijderen', // Delete
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
              console.error('Error deleting client:', error);
              ShowToast({
                status: 'error',
                message: 'Fout bij het verwijderen van de klant.',
              });
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };  

  const renderAddPersonButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => setModalVisible(true)}
          startIcon={
            <Icon as={MaterialIcons} name="add" size="xl" color="white" />
          }
          backgroundColor={btnColor}
          _pressed={{
            bg: theme.colors.fdis[500],
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

  const renderPresentClientRow = ({item}) => (
    <Pressable onPress={() => editClient(item)}>
      {({isHovered, isPressed}) => (
        <Box
          borderBottomWidth="1"
          py="3"
          borderColor="coolGray.300"
          bg={isPressed ? 'coolGray.200' : 'coolGray.100'}
          px="4"
          rounded="md"
          style={{transform: [{scale: isPressed ? 0.96 : 1}]}}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1}>
              <Text
                bold
                color="coolGray.800"
                fontSize="md"
                _dark={{color: 'warmGray.200'}}>
                {item.name}
              </Text>
            </VStack>
            <Pressable onPress={() => deletePresentClient(item)}>
              <Icon
                as={MaterialIcons}
                name="delete"
                color="red.500"
                size="xl"
              />
            </Pressable>
          </HStack>
        </Box>
      )}
    </Pressable>
  );  

  return (
    <Box flex={1}>
      <FlatList
        data={clients}
        renderItem={renderPresentClientRow}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{paddingBottom: 70}}
      />
      <RenderClientModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        btnColor={btnColor}
        value={nameClient}
        onChangeText={setNameClient}
        save={saveClient}
      />
    </Box>
  );
};

const RenderClientModal = ({
  isOpen,
  onClose,
  btnColor,
  value,
  onChangeText,
  save,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Modal.Content maxWidth="400px">
      <Modal.CloseButton />
      <Modal.Header>
        Voeg/Wijzig Persoon
      </Modal.Header>
      <Modal.Body>
        <FormControl>
          <Input
            placeholder="Type hier de naam in..."
            value={value}
            onChangeText={onChangeText}
          />
        </FormControl>
      </Modal.Body>
      <Modal.Footer>
        <Button.Group space={2}>
          <Button variant="ghost" onPress={onClose}>
            Annuleren
          </Button>
          <Button
            onPress={save}
            bg={btnColor}
            _text={{color: 'white'}}
            isDisabled={!value.trim()}>
            Opslaan
          </Button>
        </Button.Group>
      </Modal.Footer>
    </Modal.Content>
  </Modal>
);

export default AuditPersonList;
