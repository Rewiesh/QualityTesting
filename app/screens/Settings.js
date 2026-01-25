/* eslint-disable react/self-closing-comp */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-alert */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  useTheme,
  Box,
  VStack,
  Text,
  Button,
  Icon,
  ScrollView,
  useColorModeValue,
  useColorMode,
  HStack,
  Center,
  Pressable,
  Switch,
} from 'native-base';
import { fetchUserActivity } from "../services/api/newAPI";
import * as database from '../services/database/database1';
import userManager from '../services/UserManager';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Settings = ({ navigation }) => {
  const theme = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const [userName, setUserName] = useState('--');
  const [performedAuditsCount, setPerformedAuditsCount] = useState('0');
  const [lastClientName, setLastClientName] = useState('-');
  const [lastLocationName, setLastLocationName] = useState('-');

  // Modern UI Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');
  const subtextColor = useColorModeValue('coolGray.500', 'gray.400');

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

  return (
    <ScrollView flex={1} bg={bgMain} _contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Profile Section */}
      <Box px="4" pt="6" pb="4">
        <Center>
          {/* Avatar */}
          <Center
            bg="fdis.500"
            size="24"
            rounded="full"
            shadow={3}
          >
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {getInitials(userName)}
            </Text>
          </Center>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mt="3">
            {userName}
          </Text>
          <Text fontSize="sm" color={subtextColor}>
            Auditor
          </Text>
        </Center>
      </Box>

      {/* Stats Section */}
      <Box px="4" py="2">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          STATISTIEKEN
        </Text>
        <Box bg={cardBg} rounded="2xl" shadow={2} p="4">
          <HStack justifyContent="space-around">
            <StatItem
              icon="assignment-turned-in"
              iconBg="green.100"
              iconColor="green.600"
              value={performedAuditsCount}
              label="Audits"
            />
            <Box w="1" bg="gray.200" />
            <StatItem
              icon="business"
              iconBg="blue.100"
              iconColor="blue.600"
              value={lastClientName ? '1' : '0'}
              label="Klanten"
            />
            <Box w="1" bg="gray.200" />
            <StatItem
              icon="location-on"
              iconBg="purple.100"
              iconColor="purple.600"
              value={lastLocationName ? '1' : '0'}
              label="Locaties"
            />
          </HStack>
        </Box>
      </Box>

      {/* Recent Activity Section */}
      <Box px="4" py="2" mt="2">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          RECENTE ACTIVITEIT
        </Text>
        <VStack space={3}>
          <ActivityCard
            icon="business"
            iconBg="blue.100"
            iconColor="blue.600"
            title="Laatste Klant"
            value={lastClientName}
            cardBg={cardBg}
          />
          <ActivityCard
            icon="location-on"
            iconBg="purple.100"
            iconColor="purple.600"
            title="Laatste Locatie"
            value={lastLocationName}
            cardBg={cardBg}
          />
        </VStack>
      </Box>

      {/* Settings Section */}
      <Box px="4" py="2" mt="2">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          INSTELLINGEN
        </Text>
        <VStack space={3}>
          {/* Dark Mode Toggle */}
          <Box bg={cardBg} rounded="2xl" shadow={2} p="4">
            <HStack alignItems="center" space={4}>
              <Center bg={colorMode === 'dark' ? 'purple.100' : 'yellow.100'} size="12" rounded="xl">
                <Icon
                  as={MaterialIcons}
                  name={colorMode === 'dark' ? 'dark-mode' : 'light-mode'}
                  size="md"
                  color={colorMode === 'dark' ? 'purple.600' : 'yellow.600'}
                />
              </Center>
              <VStack flex={1}>
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  Donkere Modus
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  {colorMode === 'dark' ? 'Aan' : 'Uit'}
                </Text>
              </VStack>
              <Switch
                isChecked={colorMode === 'dark'}
                onToggle={toggleColorMode}
                onTrackColor="fdis.500"
                offTrackColor="gray.300"
                onThumbColor="white"
                offThumbColor="white"
                size="lg"
              />
            </HStack>
          </Box>

          {/* Statistics Dashboard Link */}
          <Pressable onPress={() => navigation.navigate('Statistieken')}>
            {({ isPressed }) => (
              <Box
                bg={isPressed ? 'teal.50' : cardBg}
                rounded="2xl"
                shadow={2}
                p="4"
                style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
              >
                <HStack alignItems="center" space={4}>
                  <Center bg="teal.100" size="12" rounded="xl">
                    <Icon as={MaterialIcons} name="bar-chart" size="md" color="teal.600" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="md" fontWeight="semibold" color={textColor}>
                      Statistieken
                    </Text>
                    <Text fontSize="sm" color={subtextColor}>
                      Bekijk audit overzicht
                    </Text>
                  </VStack>
                  <Icon as={MaterialIcons} name="chevron-right" size="sm" color="coolGray.300" />
                </HStack>
              </Box>
            )}
          </Pressable>
        </VStack>
      </Box>

      {/* Account Section */}
      <Box px="4" py="2" mt="2">
        <Text fontSize="xs" fontWeight="bold" color="gray.500" letterSpacing="lg" mb="3">
          ACCOUNT
        </Text>
        <VStack space={3}>
          {/* App Version */}
          <Box bg={cardBg} rounded="2xl" shadow={2} p="4">
            <HStack alignItems="center" space={4}>
              <Center bg="gray.100" size="12" rounded="xl">
                <Icon as={MaterialIcons} name="info" size="md" color="gray.600" />
              </Center>
              <VStack flex={1}>
                <Text fontSize="md" fontWeight="semibold" color={textColor}>
                  App Versie
                </Text>
                <Text fontSize="sm" color={subtextColor}>
                  v1.3.2
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Logout Button */}
          <Pressable onPress={logOffUser}>
            {({ isPressed }) => (
              <Box
                bg={isPressed ? 'red.100' : cardBg}
                rounded="2xl"
                shadow={2}
                p="4"
                style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
              >
                <HStack alignItems="center" space={4}>
                  <Center bg="red.100" size="12" rounded="xl">
                    <Icon as={MaterialIcons} name="logout" size="md" color="red.600" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontSize="md" fontWeight="semibold" color="red.600">
                      Uitloggen
                    </Text>
                    <Text fontSize="sm" color="coolGray.500">
                      Afmelden van uw account
                    </Text>
                  </VStack>
                  <Icon as={MaterialIcons} name="chevron-right" size="sm" color="coolGray.300" />
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
const StatItem = ({ icon, iconBg, iconColor, value, label }) => {
  const textColor = useColorModeValue('coolGray.800', 'white');
  const subtextColor = useColorModeValue('coolGray.500', 'gray.400');

  return (
    <VStack alignItems="center" space={1}>
      <Center bg={iconBg} size="10" rounded="full">
        <Icon as={MaterialIcons} name={icon} size="sm" color={iconColor} />
      </Center>
      <Text fontSize="xl" fontWeight="bold" color={textColor}>
        {value}
      </Text>
      <Text fontSize="xs" color={subtextColor}>
        {label}
      </Text>
    </VStack>
  );
};

// Activity Card Component
const ActivityCard = ({ icon, iconBg, iconColor, title, value, cardBg }) => {
  const textColor = useColorModeValue('coolGray.800', 'white');
  const subtextColor = useColorModeValue('coolGray.500', 'gray.400');

  return (
    <Box bg={cardBg} rounded="2xl" shadow={2} p="4">
      <HStack alignItems="center" space={4}>
        <Center bg={iconBg} size="12" rounded="xl">
          <Icon as={MaterialIcons} name={icon} size="md" color={iconColor} />
        </Center>
        <VStack flex={1}>
          <Text fontSize="sm" color={subtextColor}>
            {title}
          </Text>
          <Text fontSize="md" fontWeight="semibold" color={textColor} numberOfLines={1}>
            {value || '-'}
          </Text>
        </VStack>
        <Icon as={MaterialIcons} name="chevron-right" size="sm" color="coolGray.300" />
      </HStack>
    </Box>
  );
};

export default Settings;