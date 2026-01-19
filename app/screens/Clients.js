/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList as RNFlatList } from 'react-native';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ModalFooter,
  Text,
  Spinner,
  Button,
  ButtonText,
  Box,
  VStack,
  HStack,
  Heading,
  Center,
  Pressable,
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ShowToast } from '../services/Util';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import { fetchAuditData } from '../services/api/newAPI';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const Clients = ({ route, navigation }) => {
  const [unsavedData, setUnsavedData] = useState(false);
  const [loaded, setLoaded] = useState(true);
  const [clients, setClients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [searchText, setSearchText] = useState("");

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
          <Pressable
            onPress={() => navigation.navigate('Mislukte Uploads')}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <MIcon name="error-outline" size={20} color="#ef4444" />
            <Text color="$red500" fontWeight="$bold" ml="$1">{failedCount}</Text>
          </Pressable>
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
      <Center flex={1} bg="$backgroundLight100">
        <VStack space="md" alignItems="center">
          <Spinner size="large" color="$amber500" />
          <Heading color="$textDark800" fontSize="$md" fontWeight="$medium">
            Klanten worden opgehaald...
          </Heading>
        </VStack>
      </Center>
    );
  }

  // Section Header (no hooks, static)
  const renderSectionHeader = () => (
    <Box px="$4" pt="$2">
      <Text mt="$4" mb="$2" fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg">
        ACTIEVE OPDRACHTEN
      </Text>
    </Box>
  );

  return (
    <Box flex={1} bg="$backgroundLight100">
      {/* Search Bar - Outside FlatList to prevent keyboard issues */}
      <Box px="$4" pt="$4" pb="$2" bg="$backgroundLight100">
        <Input
          bg="$white"
          borderRadius="$xl"
          borderWidth={0}
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={2}
        >
          <InputSlot pl="$3">
            <MIcon name="search" size={16} color="#9ca3af" />
          </InputSlot>
          <InputField
            placeholder="Zoek opdrachtgever..."
            value={searchText}
            onChangeText={setSearchText}
            px="$4"
            py="$3"
            fontSize="$md"
            placeholderTextColor="$textLight400"
          />
          {searchText.length > 0 && (
            <InputSlot pr="$3">
              <Pressable onPress={() => setSearchText("")} p="$1">
                <MIcon name="close" size={16} color="#9ca3af" />
              </Pressable>
            </InputSlot>
          )}
        </Input>
      </Box>

      <RNFlatList
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
    <Center flex={1} mt="$10">
      <VStack alignItems="center" space="sm">
        <MIcon name="folder-open" size={48} color="#d1d5db" />
        <Text color="$textLight400" fontSize="$md">Geen opdrachten gevonden</Text>
      </VStack>
    </Center>
  );
};

// Helper to get initials and color
const getClientVisuals = (name, index) => {
  const colors = ["$blue100", "$purple100", "$green100", "$orange100", "$red100"];
  const textColors = ["#2563eb", "#9333ea", "#16a34a", "#ea580c", "#dc2626"];

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
  const [isPressed, setIsPressed] = useState(false);
  const { bg, text, initials } = getClientVisuals(item.NameClient, index || 0);

  return (
    <Pressable
      onPress={() => onListItemClick(item)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Box
        bg="$white"
        mx="$4"
        my="$2"
        p="$4"
        borderRadius="$2xl"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        style={{
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        <HStack alignItems="center" space="md">
          {/* Initials Icon */}
          <Center
            bg={bg}
            w="$12"
            h="$12"
            borderRadius="$full"
          >
            <Text color={text} fontWeight="$bold" fontSize="$md">
              {initials}
            </Text>
          </Center>

          {/* Content */}
          <VStack flex={1}>
            <Text fontSize="$md" fontWeight="$bold" color="$textDark800">
              {item.NameClient}
            </Text>
            <Text fontSize="$xs" color="$textLight400">
              Tik om te openen
            </Text>
          </VStack>

          {/* Chevron */}
          <MIcon name="chevron-right" size={16} color="#d1d5db" />
        </HStack>
      </Box>
    </Pressable>
  );
});

const RenderModal = ({ unsavedData, setUnsavedData, reloadData }) => {
  return (
    <Modal
      isOpen={unsavedData}
      onClose={() => setUnsavedData(false)}
    >
      <ModalBackdrop bg="$black" opacity={0.5} />
      <ModalContent maxWidth={400} borderRadius="$xl">
        <ModalBody pt="$6">
          <VStack space="md" alignItems="center">
            <MIcon name="warning" size={48} color="#fb923c" />
            <Text fontWeight="$bold" fontSize="$lg">Niet opgeslagen wijzigingen</Text>
            <Text textAlign="center" color="$textLight500">
              Sommige gegevens zijn niet opgeslagen. Als u doorgaat, gaan deze verloren.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter bg="transparent" borderTopWidth={0} justifyContent="center" pb="$6" gap="$3">
          <Button
            variant="outline"
            action="secondary"
            onPress={() => setUnsavedData(false)}
            borderRadius="$full"
            px="$6"
          >
            <ButtonText color="$textLight600">Annuleer</ButtonText>
          </Button>
          <Button
            onPress={() => {
              setUnsavedData(false);
              reloadData();
            }}
            bg="$red500"
            borderRadius="$full"
            px="$6"
            sx={{ ":active": { bg: "$red600" } }}
          >
            <ButtonText color="$white">Doorgaan</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default Clients;
