/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  useColorModeValue,
  Button,
  Icon,
  Center,
  Input,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

const Audits = ({ route, navigation }) => {
  const [auditsList, setAuditsList] = useState([]);
  const [user, setUser] = useState({});
  const [failedCount, setFailedCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const { clientName } = route.params;

  // Modern UI Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const inputBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');

  useFocusEffect(
    useCallback(() => {
      const updateList = async () => {
        try {
          const [auditsData, userData, failedAudits] = await Promise.all([
            database.getAuditsOfClientWithStatus(clientName),
            userManager.getCurrentUser(),
            database.getFailedAudits(),
          ]);
          setAuditsList(auditsData);
          setUser(userData);
          setFailedCount(failedAudits.length);
          log('Audits loaded:', auditsData.length);
        } catch (error) {
          logError('Failed to fetch audits:', error);
          alert('Failed to load audits. Error: ' + error.message);
        }
      };

      updateList();
    }, [clientName]),
  );

  const onAuditClick = useCallback((audit) => {
    navigation.navigate('Audit Details', {
      AuditId: audit.Id,
      clientName: clientName,
      user: user,
    });
  }, [navigation, clientName, user]);

  // Header button voor failed uploads
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        failedCount >= 0 ? (
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
            _text={{ color: "red.500", fontWeight: "bold" }}
            px="3"
            py="2"
            mr="2">
            {failedCount}
          </Button>
        ) : null,
    });
  }, [navigation, failedCount]);

  // Filter audits based on search - memoized
  const filteredAudits = useMemo(() => 
    auditsList.filter(audit =>
      String(audit.AuditCode).toLowerCase().includes(searchText.toLowerCase()) ||
      (audit.LocationClient && audit.LocationClient.toLowerCase().includes(searchText.toLowerCase()))
    ), [auditsList, searchText]);

  // Get status info for audit based on signature and form progress
  const getAuditStatus = useCallback((audit) => {
    // Completed = has signature
    if (audit.hasSignature === 1) {
      return { label: 'Completed', bg: 'green.100', color: 'green.700' };
    }
    // In Progress = has forms filled but no signature
    if (audit.hasProgress === 1) {
      return { label: 'In Progress', bg: 'orange.100', color: 'orange.700' };
    }
    // Draft = nothing filled yet
    return { label: 'Draft', bg: 'gray.200', color: 'gray.600' };
  }, []);

  // Get icon and color based on status
  const getAuditIcon = useCallback((audit) => {
    if (audit.hasSignature === 1) {
      return { name: 'check-circle', bg: 'green.100', color: 'green.600' };
    }
    if (audit.hasProgress === 1) {
      return { name: 'edit', bg: 'orange.100', color: 'orange.600' };
    }
    return { name: 'description', bg: 'blue.100', color: 'blue.600' };
  }, []);

  // Section Header
  const renderSectionHeader = () => (
    <Box px="4" pt="2">
      <HStack justifyContent="space-between" alignItems="center">
        <Text mt="4" mb="2" fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg">
          RECENT AUDITS
        </Text>
        <Text mt="4" mb="2" fontSize="xs" fontWeight="semibold" color="fdis.500">
          {filteredAudits.length} items
        </Text>
      </HStack>
    </Box>
  );

  const renderAuditRow = useCallback(({ item }) => {
    const status = getAuditStatus(item);
    const iconInfo = getAuditIcon(item);

    return (
      <Pressable onPress={() => onAuditClick(item)}>
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
              {/* Icon */}
              <Center bg={iconInfo.bg} size="12" rounded="xl">
                <Icon
                  as={MaterialIcons}
                  name={iconInfo.name}
                  size="md"
                  color={iconInfo.color}
                />
              </Center>

              {/* Content */}
              <VStack flex={1} space={1}>
                <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                  {item.isUnSaved === '*' ? '* ' : ''}{String(item.AuditCode)}
                </Text>
                <Text fontSize="sm" color="coolGray.500" numberOfLines={1}>
                  {item.LocationClient}
                </Text>
                <HStack alignItems="center" space={2} mt="1">
                  {/* Status Badge */}
                  <Box bg={status.bg} px="2" py="0.5" rounded="md">
                    <Text fontSize="2xs" fontWeight="bold" color={status.color}>
                      {status.label}
                    </Text>
                  </Box>
                  {/* Time indicator */}
                  <Text fontSize="2xs" color="coolGray.400">
                    • Tik om te openen
                  </Text>
                </HStack>
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
  }, [getAuditStatus, getAuditIcon, onAuditClick]);

  // Empty state
  const renderEmpty = () => (
    <Center flex={1} mt="10">
      <VStack alignItems="center" space={2}>
        <Icon as={MaterialIcons} name="assignment" size="4xl" color="gray.300" />
        <Text color="gray.400" fontSize="md">Geen audits gevonden</Text>
      </VStack>
    </Center>
  );

  return (
    <Box flex={1} bg={bgMain}>
      {/* Search Bar */}
      <Box px="4" pt="4" pb="2" bg={bgMain}>
        <Input
          placeholder="Zoek audit..."
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
              <Pressable onPress={() => setSearchText('')} mr="3" p="1">
                <Icon as={MaterialIcons} name="close" size="sm" color="gray.400" />
              </Pressable>
            ) : null
          }
          _focus={{
            bg: inputBg,
            borderColor: 'fdis.500',
            borderWidth: 1,
          }}
        />
      </Box>

      <FlatList
        data={filteredAudits}
        renderItem={renderAuditRow}
        keyExtractor={item => item.Id.toString()}
        ListHeaderComponent={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
        {...FLATLIST_CONFIG}
      />
    </Box>
  );
};

export default Audits;
