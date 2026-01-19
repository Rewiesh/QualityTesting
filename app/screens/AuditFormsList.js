/* eslint-disable prettier/prettier */
import React, { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Box, HStack, Text, Pressable, VStack, Center, Input, InputField, InputSlot } from '@gluestack-ui/themed';
import { FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { log, logError } from '../services/Logger';
import { FLATLIST_CONFIG } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import * as database from '../services/database/database1';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  blue: { bg: '$blue100', icon: '#2563eb' },
  purple: { bg: '$purple100', icon: '#9333ea' },
  green: { bg: '$green100', icon: '#16a34a' },
  orange: { bg: '$orange100', icon: '#ea580c' },
  teal: { bg: '$teal100', icon: '#0d9488' },
  red: { bg: '$red100', icon: '#dc2626' },
};

const AuditFormsList = ({ route, navigation }) => {
  const { AuditId, auditCode } = route.params;
  // Parse AuditId to ensure it's a number (handles "17903.0" string from iOS)
  const parsedAuditId = typeof AuditId === 'string' ? parseInt(AuditId, 10) : AuditId;
  
  const [forms, setForms] = useState([]);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Colors
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const inputBg = '$white';
  const textColor = '$textDark800';
  const subtextColor = '$textLight500';
  const borderColor = '$borderLight100';

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
  ], []);

  const renderFormRow = useCallback(({ item, index }) => {
    const items = infoItems(item);

    return (
      <Pressable onPress={() => onFormClick(item)}>
        {({ pressed }) => (
          <Box
            bg={cardBg}
            mx="$4"
            my="$1.5"
            borderRadius="$xl"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={0.1}
            shadowRadius={2}
            overflow="hidden"
            style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
          >
            {/* Header */}
            <HStack px="$3" py="$2" alignItems="center" space="sm" borderBottomWidth={1} borderColor={borderColor}>
              <Center bg="$amber100" w="$6" h="$6" borderRadius="$md">
                <MIcon name="description" size={12} color="#f59e0b" />
              </Center>
              <Text fontSize="$sm" fontWeight="$bold" color={textColor} flex={1}>
                Formulier Informatie
              </Text>
              <Center bg="$backgroundLight100" w="$6" h="$6" borderRadius="$md">
                <MIcon name="chevron-right" size={12} color="#9ca3af" />
              </Center>
            </HStack>
            
            {/* Info Items */}
            <VStack>
              {items.map((info, idx) => {
                const colors = colorMap[info.color] || colorMap.blue;
                return (
                  <HStack
                    key={idx}
                    px="$3"
                    py="$2"
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottomWidth={idx < items.length - 1 ? 1 : 0}
                    borderColor="$borderLight50"
                  >
                    <HStack alignItems="center" space="sm">
                      <Center bg={colors.bg} w="$6" h="$6" borderRadius="$md">
                        <MIcon name={info.icon} size={10} color={colors.icon} />
                      </Center>
                      <Text fontSize="$xs" color={subtextColor}>{info.label}</Text>
                    </HStack>
                    <Text fontSize="$xs" fontWeight="$semibold" color={textColor}>
                      {info.value || '-'}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        )}
      </Pressable>
    );
  }, [cardBg, onFormClick, infoItems, textColor, subtextColor, borderColor]);

  const renderHeader = useCallback(() => (
    <VStack px="$4" py="$3" space="sm">
      {/* Stats Row */}
      <HStack space="sm">
        <Box flex={1} bg={cardBg} borderRadius="$lg" p="$3" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
          <HStack alignItems="center" space="sm">
            <Center bg="$blue100" w="$8" h="$8" borderRadius="$md">
              <MIcon name="description" size={12} color="#2563eb" />
            </Center>
            <VStack>
              <Text fontSize="$lg" fontWeight="$bold" color={textColor}>{stats.total}</Text>
              <Text fontSize="$2xs" color={subtextColor}>Formulieren</Text>
            </VStack>
          </HStack>
        </Box>
        <Box flex={1} bg={cardBg} borderRadius="$lg" p="$3" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
          <HStack alignItems="center" space="sm">
            <Center bg="$green100" w="$8" h="$8" borderRadius="$md">
              <MIcon name="check-circle" size={12} color="#16a34a" />
            </Center>
            <VStack>
              <Text fontSize="$lg" fontWeight="$bold" color={textColor}>{stats.completed}</Text>
              <Text fontSize="$2xs" color={subtextColor}>Voltooid</Text>
            </VStack>
          </HStack>
        </Box>
        <Box flex={1} bg={cardBg} borderRadius="$lg" p="$3" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
          <HStack alignItems="center" space="sm">
            <Center bg="$red100" w="$8" h="$8" borderRadius="$md">
              <MIcon name="error-outline" size={12} color="#dc2626" />
            </Center>
            <VStack>
              <Text fontSize="$lg" fontWeight="$bold" color={textColor}>{stats.totalErrors}</Text>
              <Text fontSize="$2xs" color={subtextColor}>Fouten</Text>
            </VStack>
          </HStack>
        </Box>
      </HStack>

      {/* Section Title */}
      <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mt="$2">
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
        <Box px="$4" pt="$3" pb="$1" bg={bgMain}>
          <Input
            bg={inputBg}
            borderRadius="$xl"
            px="$4"
            py="$2"
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
              placeholder="Zoek formulier..."
              value={searchText}
              onChangeText={setSearchText}
              fontSize="$sm"
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
