/* eslint-disable prettier/prettier */
/**
 * StatisticsDashboard - Overview of all audits with statistics
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Box, VStack, HStack, Text, Center, Pressable, Progress, ProgressFilledTrack } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';
import { log, logError } from '../services/Logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  blue: { bg: '$blue100', icon: '#2563eb', text: '#2563eb' },
  green: { bg: '$green100', icon: '#16a34a', text: '#16a34a' },
  orange: { bg: '$orange100', icon: '#ea580c', text: '#ea580c' },
  purple: { bg: '$purple100', icon: '#9333ea', text: '#9333ea' },
  teal: { bg: '$teal100', icon: '#0d9488', text: '#0d9488' },
  red: { bg: '$red100', icon: '#dc2626', text: '#dc2626' },
  gray: { bg: '$backgroundLight200', icon: '#4b5563', text: '#4b5563' },
};

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
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const textColor = '$textDark800';
  const subtextColor = '$textLight500';

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
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Header Stats */}
      <Box px="$4" pt="$4">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          OVERZICHT
        </Text>
        
        {/* Main Stats Cards */}
        <HStack space="md" mb="$4">
          <StatCard
            icon="assignment"
            color="blue"
            value={stats.totalAudits}
            label="Totaal Audits"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon="check-circle"
            color="green"
            value={stats.completedAudits}
            label="Voltooid"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </HStack>

        <HStack space="md" mb="$4">
          <StatCard
            icon="edit"
            color="orange"
            value={stats.inProgressAudits}
            label="In Uitvoering"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
          <StatCard
            icon="drafts"
            color="gray"
            value={stats.draftAudits}
            label="Concept"
            cardBg={cardBg}
            textColor={textColor}
            subtextColor={subtextColor}
          />
        </HStack>
      </Box>

      {/* Completion Rate */}
      <Box px="$4" mb="$4">
        <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
          <HStack justifyContent="space-between" alignItems="center" mb="$3">
            <HStack alignItems="center" space="sm">
              <Center bg="$purple100" w="$10" h="$10" borderRadius="$lg">
                <MIcon name="trending-up" size={20} color="#9333ea" />
              </Center>
              <VStack>
                <Text fontSize="$md" fontWeight="$bold" color={textColor}>
                  Voltooiingspercentage
                </Text>
                <Text fontSize="$xs" color={subtextColor}>
                  {stats.completedAudits} van {stats.totalAudits} audits
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="$2xl" fontWeight="$bold" color="#9333ea">
              {completionRate}%
            </Text>
          </HStack>
          <Progress value={completionRate} size="sm" borderRadius="$full" bg="$backgroundLight200">
            <ProgressFilledTrack bg="$purple500" />
          </Progress>
        </Box>
      </Box>

      {/* Forms & Errors Stats */}
      <Box px="$4" mb="$4">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          DETAILS
        </Text>
        <HStack space="md">
          <Box flex={1} bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$4">
            <HStack alignItems="center" space="md">
              <Center bg="$teal100" w="$10" h="$10" borderRadius="$lg">
                <MIcon name="description" size={16} color="#0d9488" />
              </Center>
              <VStack>
                <Text fontSize="$xl" fontWeight="$bold" color={textColor}>
                  {stats.totalForms}
                </Text>
                <Text fontSize="$xs" color={subtextColor}>Formulieren</Text>
              </VStack>
            </HStack>
          </Box>
          <Box flex={1} bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$4">
            <HStack alignItems="center" space="md">
              <Center bg="$red100" w="$10" h="$10" borderRadius="$lg">
                <MIcon name="error-outline" size={16} color="#dc2626" />
              </Center>
              <VStack>
                <Text fontSize="$xl" fontWeight="$bold" color={textColor}>
                  {stats.totalErrors}
                </Text>
                <Text fontSize="$xs" color={subtextColor}>Fouten</Text>
              </VStack>
            </HStack>
          </Box>
        </HStack>
      </Box>

      {/* Top Clients */}
      {stats.clientStats.length > 0 && (
        <Box px="$4" mb="$4">
          <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
            TOP OPDRACHTGEVERS
          </Text>
          <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} overflow="hidden">
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
const StatCard = ({ icon, color, value, label, cardBg, textColor, subtextColor }) => {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <Box flex={1} bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
      <HStack alignItems="center" space="md">
        <Center bg={colors.bg} w="$12" h="$12" borderRadius="$xl">
          <MIcon name={icon} size={20} color={colors.icon} />
        </Center>
        <VStack>
          <Text fontSize="$2xl" fontWeight="$bold" color={textColor}>
            {value}
          </Text>
          <Text fontSize="$xs" color={subtextColor}>{label}</Text>
        </VStack>
      </HStack>
    </Box>
  );
};

// Client Stat Row Component
const ClientStatRow = ({ client, index, isLast, textColor, subtextColor }) => {
  const colorKeys = ['blue', 'purple', 'green', 'orange', 'red'];
  const colorKey = colorKeys[index % colorKeys.length];
  const colors = colorMap[colorKey] || colorMap.blue;
  const percentage = client.count > 0 ? Math.round((client.completed / client.count) * 100) : 0;

  return (
    <Box 
      px="$4" 
      py="$3" 
      borderBottomWidth={isLast ? 0 : 1} 
      borderColor="$borderLight100"
    >
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" space="md" flex={1}>
          <Center bg={colors.bg} w="$10" h="$10" borderRadius="$lg">
            <Text color={colors.text} fontWeight="$bold" fontSize="$sm">
              {client.name.substring(0, 2).toUpperCase()}
            </Text>
          </Center>
          <VStack flex={1}>
            <Text fontSize="$sm" fontWeight="$semibold" color={textColor} numberOfLines={1}>
              {client.name}
            </Text>
            <Text fontSize="$xs" color={subtextColor}>
              {client.completed}/{client.count} voltooid
            </Text>
          </VStack>
        </HStack>
        <Box bg={colors.bg} px="$2" py="$1" borderRadius="$md">
          <Text fontSize="$xs" fontWeight="$bold" color={colors.text}>
            {percentage}%
          </Text>
        </Box>
      </HStack>
    </Box>
  );
};

export default StatisticsDashboard;
