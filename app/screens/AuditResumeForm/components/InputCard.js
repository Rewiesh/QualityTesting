/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Icon, Input, useColorModeValue } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  const textColor = useColorModeValue('coolGray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box bg={cardBg} rounded="lg" shadow={1} px="3" py="2" mb="1.5">
      <HStack alignItems="center" space={2}>
        <Center bg={`${color}.100`} size="5" rounded="sm">
          <Icon as={MaterialIcons} name={icon} size="2xs" color={`${color}.600`} />
        </Center>
        <Text fontSize="xs" fontWeight="bold" color={textColor}>
          {label}
        </Text>
      </HStack>
      <Input
        mt="1"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        bg={inputBg}
        borderWidth={0}
        rounded="md"
        py="1.5"
        fontSize="sm"
        color={textColor}
      />
    </Box>
  );
};

export default React.memo(InputCard);
