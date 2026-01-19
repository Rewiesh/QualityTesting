/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Box, HStack, Text, Pressable, VStack, Button, ButtonText, Center, Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  'blue.100': '$blue100', 'blue.600': '#2563eb', 'blue.700': '#1d4ed8',
  'green.100': '$green100', 'green.600': '#16a34a', 'green.700': '#15803d',
  'orange.100': '$orange100', 'orange.600': '#ea580c', 'orange.700': '#c2410c',
  'red.100': '$red100', 'red.600': '#dc2626', 'red.700': '#b91c1c',
  'gray.200': '$backgroundLight200', 'gray.600': '#4b5563',
};

const Audits = ({ route, navigation }) => {
  const [auditsList, setAuditsList] = useState([]);
  const [user, setUser] = useState({});
  const [failedCount, setFailedCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const { clientName } = route.params;

  // Modern UI Colors
  const bgMain = '$backgroundLight100';
  const inputBg = '$white';
  const cardBg = '$white';
  const textColor = '$textDark800';
  const subtextColor = '$textLight500';

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
          <Pressable
            onPress={() => navigation.navigate('Mislukte Uploads')}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }}
          >
            <MIcon name="error-outline" size={20} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontWeight: 'bold', marginLeft: 4 }}>{failedCount}</Text>
          </Pressable>
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
      if (audit.upload_status === 'uploaded') {
        return { label: 'Geüpload', bg: '$blue100', color: '#1d4ed8' };
      }
      if (audit.upload_status === 'failed') {
        return { label: 'Upload mislukt', bg: '$red100', color: '#b91c1c' };
      }
      return { label: 'Klaar voor upload', bg: '$green100', color: '#15803d' };
    }
    // In Progress = has forms filled but no signature
    if (audit.hasProgress === 1) {
      return { label: 'In uitvoering', bg: '$orange100', color: '#c2410c' };
    }
    // Draft = nothing filled yet
    return { label: 'Concept', bg: '$backgroundLight200', color: '#4b5563' };
  }, []);

  // Get icon and color based on status
  const getAuditIcon = useCallback((audit) => {
    if (audit.hasSignature === 1) {
      if (audit.upload_status === 'uploaded') {
        return { name: 'cloud-done', bg: '$blue100', color: '#2563eb' };
      }
      if (audit.upload_status === 'failed') {
        return { name: 'error', bg: '$red100', color: '#dc2626' };
      }
      return { name: 'check-circle', bg: '$green100', color: '#16a34a' };
    }
    if (audit.hasProgress === 1) {
      return { name: 'edit', bg: '$orange100', color: '#ea580c' };
    }
    return { name: 'description', bg: '$blue100', color: '#2563eb' };
  }, []);

  // Section Header
  const renderSectionHeader = () => (
    <Box px="$4" pt="$2">
      <HStack justifyContent="space-between" alignItems="center">
        <Text mt="$4" mb="$2" fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg">
          RECENT AUDITS
        </Text>
        <Text mt="$4" mb="$2" fontSize="$xs" fontWeight="$semibold" color="$amber500">
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
        {({ pressed }) => (
          <Box
            bg={cardBg}
            mx="$4"
            my="$2"
            p="$4"
            borderRadius="$2xl"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={3}
            style={{
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }}
          >
            <HStack alignItems="center" space="md">
              {/* Icon */}
              <Center bg={iconInfo.bg} w="$12" h="$12" borderRadius="$xl">
                <MIcon name={iconInfo.name} size={20} color={iconInfo.color} />
              </Center>

              {/* Content */}
              <VStack flex={1} space="xs">
                <Text fontSize="$md" fontWeight="$bold" color={textColor}>
                  {item.isUnSaved === '*' ? '* ' : ''}{String(item.AuditCode)}
                </Text>
                <Text fontSize="$sm" color={subtextColor} numberOfLines={1}>
                  {item.LocationClient}
                </Text>
                <HStack alignItems="center" space="sm" mt="$1">
                  {/* Status Badge */}
                  <Box bg={status.bg} px="$2" py="$0.5" borderRadius="$md">
                    <Text fontSize="$2xs" fontWeight="$bold" color={status.color}>
                      {status.label}
                    </Text>
                  </Box>
                  {/* Time indicator */}
                  <Text fontSize="$2xs" color="$textLight400">
                    • Tik om te openen
                  </Text>
                </HStack>
              </VStack>

              {/* Chevron */}
              <MIcon name="chevron-right" size={16} color="#d1d5db" />
            </HStack>
          </Box>
        )}
      </Pressable>
    );
  }, [getAuditStatus, getAuditIcon, onAuditClick, cardBg, textColor, subtextColor]);

  // Empty state
  const renderEmpty = () => (
    <Center flex={1} mt="$10">
      <VStack alignItems="center" space="sm">
        <MIcon name="assignment" size={48} color="#d1d5db" />
        <Text color="$textLight400" fontSize="$md">Geen audits gevonden</Text>
      </VStack>
    </Center>
  );

  return (
    <Box flex={1} bg={bgMain}>
      {/* Search Bar */}
      <Box px="$4" pt="$4" pb="$2" bg={bgMain}>
        <Input
          bg={inputBg}
          borderRadius="$xl"
          px="$4"
          py="$3"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={2}
          borderWidth={0}
        >
          <InputSlot pl="$3">
            <MIcon name="search" size={16} color="#9ca3af" />
          </InputSlot>
          <InputField
            placeholder="Zoek audit..."
            value={searchText}
            onChangeText={setSearchText}
            fontSize="$md"
            placeholderTextColor="$textLight400"
          />
          {searchText.length > 0 && (
            <InputSlot pr="$3">
              <Pressable onPress={() => setSearchText('')} p="$1">
                <MIcon name="close" size={16} color="#9ca3af" />
              </Pressable>
            </InputSlot>
          )}
        </Input>
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
