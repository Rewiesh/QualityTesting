import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  Text,
  Spinner,
  Button,
  FlatList,
  Box,
  VStack,
  HStack,
  Heading,
  Center,
  IconButton,
  Pressable,
  useTheme, 
  useColorModeValue
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ShowToast} from '../services/Util';
import api from '../services/api/Api';
import fetchData from '../services/api/Api1';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

const Clients = ({navigation}) => {
  const theme = useTheme();
  const [unsavedData, setUnsavedData] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [clients, setClients] = useState([]);
  const [refreshing, setRefreshing] = useState(false); 
  const listBackgroundColor = useColorModeValue('white',theme.colors.fdis[800]);
  const textColor = useColorModeValue('coolGray.800', 'warmGray.50');
  const borderColor = useColorModeValue('coolGray.300', 'coolGray.600');
  const refreshingIndicatorColor = useColorModeValue(theme.colors.fdis[400],'white');
  const emptyTextColor = useColorModeValue('coolGray.800', 'warmGray.200');
  const bgColor = useColorModeValue('coolGray.100', 'gray.700');
  
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setUnsavedData(false);
    try {
      const clients = await database.getClients();
      setClients(clients);
      clients.forEach(client => {
        console.log(client.NameClient);
      });
    } catch (error) {
      alert(error);
      console.log(error);
    }
  };

  const onListItemClick = client => {
    navigation.navigate('Audits', {clientName: client.NameClient});
  };

  const onReload = () => {
    database
      .existUnSaveData()
      .then(exist => {
        console.log(exist);
        if (exist) {
          setUnsavedData(true); 
        } else {
          reloadData(); 
        }
      })
      .catch(error => {
        console.error('Error checking unsaved data:', error);
      });
  };  

  const reloadData = async () => {
    setLoaded(false);
    setRefreshing(true); // Activate the loading indicator

    try {
      const user = await userManager.getCurrentUser();
      const {data, error} = await fetchData(user.username, user.password);

      if (error) {
        ShowToast({
          status: 'error',
          message: 'Ongeldige inloggegevens.',
          bgColor: bgColor,
          textColor: textColor,
        });
      } else {
        await database.saveAllData(data);
      }

      await loadClients();
      setLoaded(true);
    } catch (error) {
      console.log(error);
      alert('Check your internet connection');
    } finally {
      setRefreshing(false); // Reset the refreshing state
    }
  };

  if (!loaded) {
    return (
      <Center flex={1} bg={listBackgroundColor}>
        <HStack space={2} justifyContent="center" alignItems="center">
          <Spinner
            size="lg"
            color={refreshingIndicatorColor}
            accessibilityLabel="Haal actieve klanten op"
          />
          <Heading color={textColor} fontSize="md">
            Klanten worden opgehaald...
          </Heading>
        </HStack>
      </Center>
    );
  }

  const renderItem = ({item}) => (
    <RenderClientRow item={item} onListItemClick={onListItemClick} />
  );
  
  return (
    <Box flex={1} bg={listBackgroundColor}>
      <FlatList
        data={clients}
        renderItem={renderItem}
        keyExtractor={item => item.Id.toString()}
        refreshing={refreshing}
        onRefresh={onReload}
        ListEmptyComponent={<RenderEmpty />}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: useColorModeValue(100, 150),
        }}
      />
      <RenderModal
        unsavedData={unsavedData}
        setUnsavedData={setUnsavedData}
        reloadData={reloadData}
      />
    </Box>
  );


};

const RenderEmpty = () => {
  const emptyTextColor = useColorModeValue('coolGray.800', 'warmGray.200');

  return (
    <Center flex={1}>
      <Text color={emptyTextColor}>Geen gegevens gevonden!</Text>
    </Center>
  );
};

const RenderClientRow = ({item, onListItemClick}) => {
  const theme = useTheme();
  const unifiedColor = useColorModeValue('coolGray.800', 'white'); // Using one color for text, icon, and borders

  const styles = {
    bgColor: useColorModeValue('coolGray.100', theme.colors.fdis[700]), // Light blue for light mode, darker blue-gray for dark mode
    pressedColor: useColorModeValue('coolGray.200', theme.colors.fdis[700]),
    borderColor: useColorModeValue(
      theme.colors.fdis[300],
      theme.colors.fdis[700],
    ), // Unified color for border
    textColor: unifiedColor, // Unified color for text
    iconColor: useColorModeValue('black', 'white'), // Unified color for icons
    borderWidth: '1',
  };

  return (
    <Pressable onPress={() => onListItemClick(item)}>
      {({isPressed}) => (
        <Box
          borderBottomWidth={styles.borderWidth}
          py="5"
          borderColor={styles.borderColor}
          shadow="3"
          bg={isPressed ? styles.pressedColor : styles.bgColor}
          p="2"
          style={{
            transform: [{scale: isPressed ? 0.96 : 1}],
          }}>
          <HStack justifyContent="space-between" alignItems="center" px="4">
            <Text bold color={styles.textColor} fontSize="md">
              {item.NameClient}
            </Text>
            <MaterialIcons
              name="navigate-next"
              size={24}
              color={styles.iconColor}
            />
          </HStack>
        </Box>
      )}
    </Pressable>
  );
};

const RenderModal = ({unsavedData, setUnsavedData, reloadData}) => {
  return (
    <Modal
      isOpen={unsavedData}
      onClose={() => setUnsavedData(false)}
      _backdrop={{
        _dark: {
          bg: 'coolGray.800',
        },
        bg: 'warmGray.50',
      }}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Waarschuwing!</Modal.Header>
        <Modal.Body>
          Sommige gegevens zijn niet opgeslagen. Als u doorgaat, gaan deze
          verloren. Wilt u doorgaan?
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={() => setUnsavedData(false)}>
              Annuleer
            </Button>
            <Button
              onPress={() => {
                setUnsavedData(false); 
                reloadData(); 
              }}>
              Doorgaan
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};


export default Clients;
