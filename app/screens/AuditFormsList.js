/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  useColorModeValue,
  Icon,
  Center,
  Input,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import * as database from '../services/database/database1';

const AuditFormsList = ({ route, navigation }) => {
  const { AuditId, auditCode } = route.params;
  // Parse AuditId to ensure it's a number (handles "17903.0" string from iOS)
  const parsedAuditId = typeof AuditId === 'string' ? parseInt(AuditId, 10) : AuditId;
  
  const [forms, setForms] = useState([]);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          log('Fetching forms for AuditId:', parsedAuditId);
          const [formsData, auditData] = await Promise.all([
            database.getFormsWithDetails(parsedAuditId),
            database.getAuditById(parsedAuditId),
          ]);
          setForms(formsData);
          setAudit(auditData);
          log('Forms loaded:', formsData.length);
        } catch (error) {
          logError('Failed to fetch forms:', error);
          Alert.alert('Fout', 'Kon formulieren niet laden.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [parsedAuditId])
  );

  const onFormClick = useCallback((form) => {
    // Direct naar Fouten Lijst navigeren
    navigation.navigate('Fouten Lijst', { form });
  }, [navigation]);

  // Filter forms based on search
  const filteredForms = useMemo(() => {
    if (!searchText.trim()) return forms;
    const search = searchText.toLowerCase();
    return forms.filter(f => 
      (f.CategoryValue?.toLowerCase().includes(search)) ||
      (f.FloorValue?.toLowerCase().includes(search)) ||
      (f.AreaValue?.toLowerCase().includes(search)) ||
      (f.AreaNumber?.toString().includes(search))
    );
  }, [forms, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredForms.length;
    const completed = filteredForms.filter(f => f.Completed === 1).length;
    const totalErrors = filteredForms.reduce((sum, f) => sum + (f.ErrorCount || 0), 0);
    return { total, completed, totalErrors };
  }, [filteredForms]);

  const infoItems = useCallback((item) => [
    { label: 'Categorie', value: item.CategoryValue, icon: 'category', color: 'blue' },
    { label: 'Verdieping', value: item.FloorValue, icon: 'layers', color: 'purple' },
    { label: 'Ruimte Omschrijving', value: item.AreaValue, icon: 'room', color: 'green' },
    { label: 'Ruimtenummer', value: item.AreaNumber, icon: 'pin', color: 'orange' },
    { label: 'Tel-element', value: item.CounterElements, icon: 'calculate', color: 'teal' },
    { label: 'Fouten', value: item.ErrorCount || 0, icon: 'error-outline', color: 'red' },
    { label: 'Opmerkingen', value: item.RemarkCount || 0, icon: 'comment', color: 'cyan' },
  ], []);

  const renderFormRow = useCallback(({ item, index }) => {
    const items = infoItems(item);

    return (
      <Pressable onPress={() => onFormClick(item)}>
        {({ isPressed }) => (
          <Box
            bg={cardBg}
            mx="4"
            my="1.5"
            rounded="xl"
            shadow={1}
            overflow="hidden"
            style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
          >
            {/* Header */}
            <HStack px="3" py="2" alignItems="center" space={2} borderBottomWidth={1} borderColor={borderColor}>
              <Center bg="fdis.100" size="6" rounded="md">
                <Icon as={MaterialIcons} name="description" size="xs" color="fdis.600" />
              </Center>
              <Text fontSize="sm" fontWeight="bold" color={textColor} flex={1}>
                Formulier Informatie
              </Text>
              <Center bg="gray.100" size="6" rounded="md">
                <Icon as={MaterialIcons} name="chevron-right" size="xs" color="gray.400" />
              </Center>
            </HStack>
            
            {/* Info Items */}
            <VStack>
              {items.map((info, idx) => (
                <HStack
                  key={idx}
                  px="3"
                  py="2"
                  alignItems="center"
                  justifyContent="space-between"
                  borderBottomWidth={idx < items.length - 1 ? 1 : 0}
                  borderColor="gray.50"
                >
                  <HStack alignItems="center" space={2}>
                    <Center bg={`${info.color}.100`} size="6" rounded="md">
                      <Icon as={MaterialIcons} name={info.icon} size="2xs" color={`${info.color}.600`} />
                    </Center>
                    <Text fontSize="xs" color={subtextColor}>{info.label}</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                    {info.value || '-'}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </Pressable>
    );
  }, [cardBg, onFormClick, infoItems, textColor, subtextColor, borderColor]);

  const renderHeader = useCallback(() => (
    <VStack px="4" py="3" space={2}>
      {/* Stats Row */}
      <HStack space={2}>
        <Box flex={1} bg={cardBg} rounded="lg" p="3" shadow={1}>
          <HStack alignItems="center" space={2}>
            <Center bg="blue.100" size="8" rounded="md">
              <Icon as={MaterialIcons} name="description" size="xs" color="blue.600" />
            </Center>
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>{stats.total}</Text>
              <Text fontSize="2xs" color={subtextColor}>Formulieren</Text>
            </VStack>
          </HStack>
        </Box>
        <Box flex={1} bg={cardBg} rounded="lg" p="3" shadow={1}>
          <HStack alignItems="center" space={2}>
            <Center bg="green.100" size="8" rounded="md">
              <Icon as={MaterialIcons} name="check-circle" size="xs" color="green.600" />
            </Center>
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>{stats.completed}</Text>
              <Text fontSize="2xs" color={subtextColor}>Voltooid</Text>
            </VStack>
          </HStack>
        </Box>
        <Box flex={1} bg={cardBg} rounded="lg" p="3" shadow={1}>
          <HStack alignItems="center" space={2}>
            <Center bg="red.100" size="8" rounded="md">
              <Icon as={MaterialIcons} name="error-outline" size="xs" color="red.600" />
            </Center>
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>{stats.totalErrors}</Text>
              <Text fontSize="2xs" color={subtextColor}>Fouten</Text>
            </VStack>
          </HStack>
        </Box>
      </HStack>

      {/* Section Title */}
      <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mt="2">
        ALLE FORMULIEREN
      </Text>
    </VStack>
  ), [cardBg, stats, textColor, subtextColor]);

  const renderEmpty = useCallback(() => (
    <EmptyState
      icon="description"
      iconColor="blue.400"
      iconBg="blue.100"
      title="Geen formulieren"
      description="Er zijn nog geen formulieren aangemaakt voor deze audit."
      actionLabel="Nieuw Formulier"
      onAction={() => audit && navigation.navigate('Uitgevoerde Audit', { audit })}
    />
  ), [navigation, audit]);

  return (
    <Box flex={1} bg={bgMain}>
      {/* Search Bar */}
      {forms.length > 0 && (
        <Box px="4" pt="3" pb="1" bg={bgMain}>
          <Input
            placeholder="Zoek formulier..."
            value={searchText}
            onChangeText={setSearchText}
            bg={inputBg}
            rounded="xl"
            px="4"
            py="2"
            shadow={1}
            borderWidth={0}
            fontSize="sm"
            placeholderTextColor="gray.400"
            InputLeftElement={
              <Icon as={MaterialIcons} name="search" size="sm" color="gray.400" ml="3" />
            }
            InputRightElement={
              searchText.length > 0 ? (
                <Pressable onPress={() => setSearchText('')} mr="3" p="1">
                  <Icon as={MaterialIcons} name="close" size="sm" color="gray.400" />
                </Pressable>
              ) : null
            }
          />
        </Box>
      )}

      <FlatList
        data={filteredForms}
        renderItem={renderFormRow}
        keyExtractor={item => item.FormId.toString()}
        ListHeaderComponent={forms.length > 0 ? renderHeader : null}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        {...FLATLIST_CONFIG}
      />
    </Box>
  );
};

export default AuditFormsList;
