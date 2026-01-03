/* eslint-disable prettier/prettier */
/**
 * StatisticsDashboard - Overview of all audits with statistics
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Box,
  VStack,
  HStack,
  Text,
  ScrollView,
  Center,
  Icon,
  useColorModeValue,
  Pressable,
  Progress,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import { log, logError } from '../services/Logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StatisticsDashboard = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalAudits: 0,
    completedAudits: 0,
    inProgressAudits: 0,
    draftAudits: 0,
    totalForms: 0,
    totalErrors: 0,
    clientStats: [],
  });
  const [loading, setLoading] = useState(true);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');
  const subtextColor = useColorModeValue('coolGray.500', 'gray.400');

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          setLoading(true);
          
          // Get all audits
          const allAudits = await database.getAllAuditsForStats();
          
          // Calculate stats
          const completed = allAudits.filter(a => a.hasSignature === 1).length;
          const inProgress = allAudits.filter(a => a.hasProgress === 1 && a.hasSignature !== 1).length;
          const draft = allAudits.length - completed - inProgress;

          // Get forms count
          const allForms = await database.getAllFormsForStats();
          
          // Get errors count
          const allErrors = await database.getAllErrorsForStats();

          // Group by client
          const clientMap = {};
          allAudits.forEach(audit => {
            const clientName = audit.ClientName || 'Onbekend';
            if (!clientMap[clientName]) {
              clientMap[clientName] = { name: clientName, count: 0, completed: 0 };
            }
            clientMap[clientName].count++;
            if (audit.hasSignature === 1) {
              clientMap[clientName].completed++;
            }
          });

          const clientStats = Object.values(clientMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          setStats({
            totalAudits: allAudits.length,
            completedAudits: completed,
            inProgressAudits: inProgress,
            draftAudits: draft,
            totalForms: allForms?.length || 0,
            totalErrors: allErrors?.length || 0,
            clientStats,
          });
        } catch (error) {
          logError('Failed to fetch statistics:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, [])
  );

  const completionRate = useMemo(() => {
    if (stats.totalAudits === 0) return 0;
    return Math.round((stats.completedAudits / stats.totalAudits) * 100);
  }, [stats.totalAudits, stats.completedAudits]);

  return (
    <ScrollView flex={1} bg={bgMain} _contentContainerStyle={{ pb: 20 }}>
      {/* Header Stats */}
      <Box px="4" pt="4">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          OVERZICHT
        </Text>
        
        {/* Main Stats Cards */}
        <HStack space={3} mb="4">
          <StatCard
            icon="assignment"
            iconBg="blue.100"
            iconColor="blue.600"
            value={stats.totalAudits}
            label="Totaal Audits"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon="check-circle"
            iconBg="green.100"
            iconColor="green.600"
            value={stats.completedAudits}
            label="Voltooid"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </HStack>

        <HStack space={3} mb="4">
          <StatCard
            icon="edit"
            iconBg="orange.100"
            iconColor="orange.600"
            value={stats.inProgressAudits}
            label="In Uitvoering"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon="drafts"
            iconBg="gray.200"
            iconColor="gray.600"
            value={stats.draftAudits}
            label="Concept"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </HStack>
      </Box>

      {/* Completion Rate */}
      <Box px="4" mb="4">
        <Box bg={cardBg} rounded="2xl" shadow={2} p="4">
          <HStack justifyContent="space-between" alignItems="center" mb="3">
            <HStack alignItems="center" space={2}>
              <Center bg="purple.100" size="10" rounded="lg">
                <Icon as={MaterialIcons} name="trending-up" size="md" color="purple.600" />
              </Center>
              <VStack>
                <Text fontSize="md" fontWeight="bold" color={textColor}>
                  Voltooiingspercentage
                </Text>
                <Text fontSize="xs" color={subtextColor}>
                  {stats.completedAudits} van {stats.totalAudits} audits
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {completionRate}%
            </Text>
          </HStack>
          <Progress 
            value={completionRate} 
            colorScheme="purple" 
            size="sm" 
            rounded="full"
            bg="gray.200"
          />
        </Box>
      </Box>

      {/* Forms & Errors Stats */}
      <Box px="4" mb="4">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          DETAILS
        </Text>
        <HStack space={3}>
          <Box flex={1} bg={cardBg} rounded="xl" shadow={1} p="4">
            <HStack alignItems="center" space={3}>
              <Center bg="teal.100" size="10" rounded="lg">
                <Icon as={MaterialIcons} name="description" size="sm" color="teal.600" />
              </Center>
              <VStack>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {stats.totalForms}
                </Text>
                <Text fontSize="xs" color={subtextColor}>Formulieren</Text>
              </VStack>
            </HStack>
          </Box>
          <Box flex={1} bg={cardBg} rounded="xl" shadow={1} p="4">
            <HStack alignItems="center" space={3}>
              <Center bg="red.100" size="10" rounded="lg">
                <Icon as={MaterialIcons} name="error-outline" size="sm" color="red.600" />
              </Center>
              <VStack>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {stats.totalErrors}
                </Text>
                <Text fontSize="xs" color={subtextColor}>Fouten</Text>
              </VStack>
            </HStack>
          </Box>
        </HStack>
      </Box>

      {/* Top Clients */}
      {stats.clientStats.length > 0 && (
        <Box px="4" mb="4">
          <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
            TOP OPDRACHTGEVERS
          </Text>
          <Box bg={cardBg} rounded="2xl" shadow={2} overflow="hidden">
            {stats.clientStats.map((client, index) => (
              <ClientStatRow
                key={index}
                client={client}
                index={index}
                isLast={index === stats.clientStats.length - 1}
                textColor={textColor}
                subtextColor={subtextColor}
              />
            ))}
          </Box>
        </Box>
      )}
    </ScrollView>
  );
};

// Stat Card Component
const StatCard = ({ icon, iconBg, iconColor, value, label, cardBg, textColor, subtextColor }) => (
  <Box flex={1} bg={cardBg} rounded="2xl" shadow={2} p="4">
    <HStack alignItems="center" space={3}>
      <Center bg={iconBg} size="12" rounded="xl">
        <Icon as={MaterialIcons} name={icon} size="md" color={iconColor} />
      </Center>
      <VStack>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          {value}
        </Text>
        <Text fontSize="xs" color={subtextColor}>{label}</Text>
      </VStack>
    </HStack>
  </Box>
);

// Client Stat Row Component
const ClientStatRow = ({ client, index, isLast, textColor, subtextColor }) => {
  const colors = ['blue', 'purple', 'green', 'orange', 'red'];
  const color = colors[index % colors.length];
  const percentage = client.count > 0 ? Math.round((client.completed / client.count) * 100) : 0;

  return (
    <Box 
      px="4" 
      py="3" 
      borderBottomWidth={isLast ? 0 : 1} 
      borderColor="gray.100"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" space={3} flex={1}>
          <Center bg={`${color}.100`} size="10" rounded="lg">
            <Text color={`${color}.600`} fontWeight="bold" fontSize="sm">
              {client.name.substring(0, 2).toUpperCase()}
            </Text>
          </Center>
          <VStack flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} numberOfLines={1}>
              {client.name}
            </Text>
            <Text fontSize="xs" color={subtextColor}>
              {client.completed}/{client.count} voltooid
            </Text>
          </VStack>
        </HStack>
        <Box bg={`${color}.100`} px="2" py="1" rounded="md">
          <Text fontSize="xs" fontWeight="bold" color={`${color}.600`}>
            {percentage}%
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default StatisticsDashboard;
