/* eslint-disable react/self-closing-comp */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Box, VStack, Text, HStack, Center, Pressable, Switch } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { fetchUserActivity } from "../services/api/newAPI";
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  green: { bg: '$green100', icon: '#16a34a' },
  blue: { bg: '$blue100', icon: '#2563eb' },
  purple: { bg: '$purple100', icon: '#9333ea' },
  yellow: { bg: '$yellow100', icon: '#ca8a04' },
  teal: { bg: '$teal100', icon: '#0d9488' },
  gray: { bg: '$backgroundLight100', icon: '#4b5563' },
  red: { bg: '$red100', icon: '#dc2626' },
};

const Settings = ({ navigation }) => {
  const [userName, setUserName] = useState('--');
  const [performedAuditsCount, setPerformedAuditsCount] = useState('0');
  const [lastClientName, setLastClientName] = useState('-');
  const [lastLocationName, setLastLocationName] = useState('-');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modern UI Colors
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const textColor = '$textDark800';
  const subtextColor = '$textLight500';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userManager.getCurrentUser();
        setUserName(user.username);
        const activity = await fetchUserActivity(user.username, user.password);
        await database.insertSettings(
          activity.data.performedAuditsCount,
          activity.data.lastClientName,
          activity.data.lastClientLocationName,
        );
        const settings = await database.getSettings();
        setPerformedAuditsCount(settings.auditExecuted || '0');
        setLastClientName(settings.lastClient || '-');
        setLastLocationName(settings.lastLocationVisited || '-');
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);

  const logOffUser = () => {
    Alert.alert(
      'Uitloggen',
      'Weet u zeker dat u wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: () => {
            Promise.all([userManager.logout(), database.clearSettings()]).then(() => {
              navigation.navigate('Login');
            });
          },
        },
      ],
    );
  };

  // Get initials from username
  const getInitials = (name) => {
    if (!name || name === '--') return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const toggleColorMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Profile Section */}
      <Box px="$4" pt="$6" pb="$4">
        <Center>
          {/* Avatar */}
          <Center
            bg="$amber500"
            w="$24"
            h="$24"
            borderRadius="$full"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.2}
            shadowRadius={3}
          >
            <Text color="$white" fontSize="$2xl" fontWeight="$bold">
              {getInitials(userName)}
            </Text>
          </Center>
          <Text fontSize="$xl" fontWeight="$bold" color={textColor} mt="$3">
            {userName}
          </Text>
          <Text fontSize="$sm" color={subtextColor}>
            Auditor
          </Text>
        </Center>
      </Box>

      {/* Stats Section */}
      <Box px="$4" py="$2">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          STATISTIEKEN
        </Text>
        <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
          <HStack justifyContent="space-around">
            <StatItem
              icon="assignment-turned-in"
              color="green"
              value={performedAuditsCount}
              label="Audits"
            />
            <Box w={1} bg="$backgroundLight200" />
            <StatItem
              icon="business"
              color="blue"
              value={lastClientName ? '1' : '0'}
              label="Klanten"
            />
            <Box w={1} bg="$backgroundLight200" />
            <StatItem
              icon="location-on"
              color="purple"
              value={lastLocationName ? '1' : '0'}
              label="Locaties"
            />
          </HStack>
        </Box>
      </Box>

      {/* Recent Activity Section */}
      <Box px="$4" py="$2" mt="$2">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          RECENTE ACTIVITEIT
        </Text>
        <VStack space="md">
          <ActivityCard
            icon="business"
            color="blue"
            title="Laatste Klant"
            value={lastClientName}
            cardBg={cardBg}
          />
          <ActivityCard
            icon="location-on"
            color="purple"
            title="Laatste Locatie"
            value={lastLocationName}
            cardBg={cardBg}
          />
        </VStack>
      </Box>

      {/* Settings Section */}
      <Box px="$4" py="$2" mt="$2">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          INSTELLINGEN
        </Text>
        <VStack space="md">
          {/* Dark Mode Toggle */}
          <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
            <HStack alignItems="center" space="md">
              <Center bg={isDarkMode ? '$purple100' : '$yellow100'} w="$12" h="$12" borderRadius="$xl">
                <MIcon
                  name={isDarkMode ? 'dark-mode' : 'light-mode'}
                  size={20}
                  color={isDarkMode ? '#9333ea' : '#ca8a04'}
                />
              </Center>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$semibold" color={textColor}>
                  Donkere Modus
                </Text>
                <Text fontSize="$sm" color={subtextColor}>
                  {isDarkMode ? 'Aan' : 'Uit'}
                </Text>
              </VStack>
              <Switch
                value={isDarkMode}
                onValueChange={toggleColorMode}
                trackColor={{ false: '#d1d5db', true: '#f59e0b' }}
                thumbColor="#fff"
              />
            </HStack>
          </Box>

          {/* Statistics Dashboard Link */}
          <Pressable onPress={() => navigation.navigate('Statistieken')}>
            {({ pressed }) => (
              <Box
                bg={pressed ? '$teal50' : cardBg}
                borderRadius="$2xl"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.15}
                shadowRadius={3}
                p="$4"
                style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
              >
                <HStack alignItems="center" space="md">
                  <Center bg="$teal100" w="$12" h="$12" borderRadius="$xl">
                    <MIcon name="bar-chart" size={20} color="#0d9488" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color={textColor}>
                      Statistieken
                    </Text>
                    <Text fontSize="$sm" color={subtextColor}>
                      Bekijk audit overzicht
                    </Text>
                  </VStack>
                  <MIcon name="chevron-right" size={16} color="#d1d5db" />
                </HStack>
              </Box>
            )}
          </Pressable>
        </VStack>
      </Box>

      {/* Account Section */}
      <Box px="$4" py="$2" mt="$2">
        <Text fontSize="$xs" fontWeight="$bold" color="$textLight500" letterSpacing="$lg" mb="$3">
          ACCOUNT
        </Text>
        <VStack space="md">
          {/* App Version */}
          <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
            <HStack alignItems="center" space="md">
              <Center bg="$backgroundLight100" w="$12" h="$12" borderRadius="$xl">
                <MIcon name="info" size={20} color="#4b5563" />
              </Center>
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$semibold" color={textColor}>
                  App Versie
                </Text>
                <Text fontSize="$sm" color={subtextColor}>
                  v1.3.1
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Logout Button */}
          <Pressable onPress={logOffUser}>
            {({ pressed }) => (
              <Box
                bg={pressed ? '$red100' : cardBg}
                borderRadius="$2xl"
                shadowColor="$black"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.15}
                shadowRadius={3}
                p="$4"
                style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
              >
                <HStack alignItems="center" space="md">
                  <Center bg="$red100" w="$12" h="$12" borderRadius="$xl">
                    <MIcon name="logout" size={20} color="#dc2626" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="$md" fontWeight="$semibold" color="#dc2626">
                      Uitloggen
                    </Text>
                    <Text fontSize="$sm" color="$textLight500">
                      Afmelden van uw account
                    </Text>
                  </VStack>
                  <MIcon name="chevron-right" size={16} color="#d1d5db" />
                </HStack>
              </Box>
            )}
          </Pressable>
        </VStack>
      </Box>
    </ScrollView>
  );
};

// Stat Item Component
const StatItem = ({ icon, color, value, label }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <VStack alignItems="center" space="xs">
      <Center bg={colors.bg} w="$10" h="$10" borderRadius="$full">
        <MIcon name={icon} size={16} color={colors.icon} />
      </Center>
      <Text fontSize="$xl" fontWeight="$bold" color="$textDark800">
        {value}
      </Text>
      <Text fontSize="$xs" color="$textLight500">
        {label}
      </Text>
    </VStack>
  );
};

// Activity Card Component
const ActivityCard = ({ icon, color, title, value, cardBg }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4">
      <HStack alignItems="center" space="md">
        <Center bg={colors.bg} w="$12" h="$12" borderRadius="$xl">
          <MIcon name={icon} size={20} color={colors.icon} />
        </Center>
        <VStack flex={1}>
          <Text fontSize="$sm" color="$textLight500">
            {title}
          </Text>
          <Text fontSize="$md" fontWeight="$semibold" color="$textDark800" numberOfLines={1}>
            {value || '-'}
          </Text>
        </VStack>
        <MIcon name="chevron-right" size={16} color="#d1d5db" />
      </HStack>
    </Box>
  );
};

export default Settings;