/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
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
  Pressable,
  useTheme,
  useColorModeValue,
  Icon,
  Input
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ShowToast } from '../services/Util';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import { fetchAuditData } from '../services/api/newAPI';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

const Clients = ({ route, navigation }) => {
  const theme = useTheme();
  const [unsavedData, setUnsavedData] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [clients, setClients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [searchText, setSearchText] = useState(""); // Add search state

  // Modern UI Colors
  const bgMain = useColorModeValue("coolGray.100", "gray.900"); // Light gray background for the screen
  const textTitle = useColorModeValue("coolGray.800", "white");
  const inputBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    loadClients();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchFailedCount = async () => {
        try {
          const failedAudits = await database.getFailedAudits();
          setFailedCount(failedAudits.length);
        } catch (error) {
          console.error('Error fetching failed count:', error);
        }
      };
      fetchFailedCount();
    }, [])
  );

  // Header button voor failed uploads
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        failedCount > 0 ? (
          <Button
            onPress={() => navigation.navigate('Mislukte Uploads')}
            startIcon={
              <Icon
                as={MaterialIcons}
                name="error-outline"
                size="lg"
                color="red.500"
              />
            }
            variant="ghost"
            _pressed={{ bg: "red.100" }}
            _text={{ color: "red.500", fontWeight: "bold" }}
            px="3"
            py="2"
            mr="2">
            {failedCount}
          </Button>
        ) : null,
    });
  }, [navigation, failedCount]);

  const loadClients = useCallback(async () => {
    setUnsavedData(false);
    try {
      const fetchedClients = await database.getClients();
      log('Clients loaded:', fetchedClients.length);
      setClients(fetchedClients);
    } catch (error) {
      alert(error);
      logError('Error loading clients:', error);
    }
  }, []);

  const onListItemClick = useCallback((client) => {
    navigation.navigate("Audits", { clientName: client.NameClient });
  }, [navigation]);

  const onReload = useCallback(() => {
    database
      .existUnSaveData()
      .then(exist => {
        if (exist) {
          setUnsavedData(true);
        } else {
          reloadData();
        }
      })
      .catch(error => {
        logError("Error checking unsaved data:", error);
      });
  }, [reloadData]);

  const reloadData = useCallback(async () => {
    setLoaded(false);
    setRefreshing(true);

    try {
      const user = await userManager.getCurrentUser();
      const { data, error } = await fetchAuditData(user.username, user.password);

      if (error) {
        ShowToast({
          status: "error",
          message: "Ongeldige inloggegevens.",
        });
      } else {
        await database.saveAllData(data);
      }

      await loadClients();
      setLoaded(true);
    } catch (error) {
      logError('Reload data error:', error);
      alert("Check your internet connection");
    } finally {
      setRefreshing(false);
    }
  }, [loadClients]);

  // Filter clients based on search text - memoized
  const filteredClients = useMemo(() => 
    clients.filter(client =>
      client.NameClient.toLowerCase().includes(searchText.toLowerCase())
    ), [clients, searchText]);

  // IMPORTANT: All hooks must be called before any early return
  const renderItem = useCallback(({ item, index }) => (
    <RenderClientRow item={item} index={index} onListItemClick={onListItemClick} />
  ), [onListItemClick]);

  if (!loaded) {
    return (
      <Center flex={1} bg={bgMain}>
        <VStack space={4} alignItems="center">
          <Spinner size="lg" color={theme.colors.fdis[500]} />
          <Heading color={textTitle} fontSize="md" fontWeight="medium">
            Klanten worden opgehaald...
          </Heading>
        </VStack>
      </Center>
    );
  }

  // Section Header (no hooks, static)
  const renderSectionHeader = () => (
    <Box px="4" pt="2">
      <Text mt="4" mb="2" fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg">
        ACTIEVE OPDRACHTEN
      </Text>
    </Box>
  );

  return (
    <Box flex={1} bg={bgMain}>
      {/* Search Bar - Outside FlatList to prevent keyboard issues */}
      <Box px="4" pt="4" pb="2" bg={bgMain}>
        <Input
          placeholder="Zoek opdrachtgever..."
          value={searchText}
          onChangeText={setSearchText}
          bg={inputBg}
          rounded="xl"
          px="4"
          py="3"
          shadow={1}
          borderWidth={0}
          fontSize="md"
          placeholderTextColor="gray.400"
          InputLeftElement={
            <Icon as={MaterialIcons} name="search" size="sm" color="gray.400" ml="3" />
          }
          InputRightElement={
            searchText.length > 0 ? (
              <Pressable onPress={() => setSearchText("")} mr="3" p="1">
                <Icon as={MaterialIcons} name="close" size="sm" color="gray.400" />
              </Pressable>
            ) : null
          }
          _focus={{
            bg: inputBg,
            borderColor: "fdis.500",
            borderWidth: 1,
          }}
        />
      </Box>

      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={item => item.Id.toString()}
        refreshing={refreshing}
        onRefresh={onReload}
        ListHeaderComponent={renderSectionHeader}
        ListEmptyComponent={<RenderEmpty />}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        {...FLATLIST_CONFIG}
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
  return (
    <Center flex={1} mt="10">
      <VStack alignItems="center" space={2}>
        <Icon as={MaterialIcons} name="folder-open" size="4xl" color="gray.300" />
        <Text color="gray.400" fontSize="md">Geen opdrachten gevonden</Text>
      </VStack>
    </Center>
  );
};

// Helper to get initials and color
const getClientVisuals = (name, index) => {
  const colors = ["blue.100", "purple.100", "green.100", "orange.100", "red.100"];
  const textColors = ["blue.600", "purple.600", "green.600", "orange.600", "red.600"];

  const colorIndex = index % colors.length;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return { bg: colors[colorIndex], text: textColors[colorIndex], initials };
};

const RenderClientRow = React.memo(({ item, index, onListItemClick }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const { bg, text, initials } = getClientVisuals(item.NameClient, index || 0);

  return (
    <Pressable onPress={() => onListItemClick(item)}>
      {({ isPressed }) => (
        <Box
          bg={cardBg}
          mx="4"
          my="2"
          p="4"
          rounded="2xl"
          shadow={2}
          style={{
            transform: [{ scale: isPressed ? 0.98 : 1 }],
          }}
        >
          <HStack alignItems="center" space={4}>
            {/* Initials Icon */}
            <Center
              bg={bg}
              size="12"
              rounded="full"
            >
              <Text color={text} fontWeight="bold" fontSize="md">
                {initials}
              </Text>
            </Center>

            {/* Content */}
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                {item.NameClient}
              </Text>
              <Text fontSize="xs" color="coolGray.400">
                Tik om te openen
              </Text>
            </VStack>

            {/* Chevron */}
            <Icon
              as={MaterialIcons}
              name="chevron-right"
              size="sm"
              color="coolGray.300"
            />
          </HStack>
        </Box>
      )}
    </Pressable>
  );
});

const RenderModal = ({ unsavedData, setUnsavedData, reloadData }) => {
  return (
    <Modal
      isOpen={unsavedData}
      onClose={() => setUnsavedData(false)}
      _backdrop={{ bg: "black", opacity: 0.5 }}
    >
      <Modal.Content maxWidth="400px" rounded="xl">
        <Modal.Body pt="6">
          <VStack space={3} alignItems="center">
            <Icon as={MaterialIcons} name="warning" size="4xl" color="orange.400" />
            <Text fontWeight="bold" fontSize="lg">Niet opgeslagen wijzigingen</Text>
            <Text textAlign="center" color="gray.500">
              Sommige gegevens zijn niet opgeslagen. Als u doorgaat, gaan deze verloren.
            </Text>
          </VStack>
        </Modal.Body>
        <Modal.Footer bg="transparent" borderTopWidth={0} justifyContent="center" pb="6">
          <Button.Group space={3}>
            <Button
              variant="subtle"
              colorScheme="coolGray"
              onPress={() => setUnsavedData(false)}
              rounded="full"
              px="6"
            >
              Annuleer
            </Button>
            <Button
              onPress={() => {
                setUnsavedData(false);
                reloadData();
              }}
              colorScheme="danger"
              rounded="full"
              px="6"
            >
              Doorgaan
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};


export default Clients;
