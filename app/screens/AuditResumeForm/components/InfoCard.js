/* eslint-disable prettier/prettier */
import React from 'react';
import { Text, HStack, Center } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  indigo: { bg: '$indigo100', icon: '#4f46e5' },
};

const InfoCard = ({ label, value, icon, color, cardBg }) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <HStack
      px="$3"
      py="$2"
      alignItems="center"
      justifyContent="space-between"
      bg={cardBg}
      mb="$1.5"
      borderRadius="$lg"
      shadowColor="$black"
      shadowOffset={{ width: 0, height: 1 }}
      shadowOpacity={0.1}
      shadowRadius={2}
    >
      <HStack alignItems="center" space="sm">
        <Center bg={colors.bg} w="$6" h="$6" borderRadius="$md">
          <MIcon name={icon} size={12} color={colors.icon} />
        </Center>
        <Text fontSize="$xs" color="$textLight500">{label}</Text>
      </HStack>
      <Text fontSize="$xs" fontWeight="$semibold" color="$textDark800">
        {value || '-'}
      </Text>
    </HStack>
  );
};

export default React.memo(InfoCard);
