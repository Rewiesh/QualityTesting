/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Input, InputField } from '@gluestack-ui/themed';
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

const InputCard = ({
  label,
  icon,
  color,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  cardBg,
}) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Box bg={cardBg} borderRadius="$lg" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} px="$3" py="$2" mb="$1.5">
      <HStack alignItems="center" space="sm">
        <Center bg={colors.bg} w="$5" h="$5" borderRadius="$sm">
          <MIcon name={icon} size={10} color={colors.icon} />
        </Center>
        <Text fontSize="$xs" fontWeight="$bold" color="$textDark800">
          {label}
        </Text>
      </HStack>
      <Input
        mt="$1"
        bg="$backgroundLight50"
        borderWidth={0}
        borderRadius="$md"
        py="$1.5"
      >
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          fontSize="$sm"
          color="$textDark800"
        />
      </Input>
    </Box>
  );
};

export default React.memo(InputCard);
