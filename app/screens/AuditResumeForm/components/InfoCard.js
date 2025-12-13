/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Icon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const InfoCard = ({ label, value, icon, color, cardBg }) => {
  return (
    <HStack
      px="3"
      py="2"
      alignItems="center"
      justifyContent="space-between"
      bg={cardBg}
      mb="1.5"
      rounded="lg"
      shadow={1}
    >
      <HStack alignItems="center" space={2}>
        <Center bg={`${color}.100`} size="6" rounded="md">
          <Icon as={MaterialIcons} name={icon} size="xs" color={`${color}.600`} />
        </Center>
        <Text fontSize="xs" color="gray.500">{label}</Text>
      </HStack>
      <Text fontSize="xs" fontWeight="semibold" color="coolGray.800">
        {value || '-'}
      </Text>
    </HStack>
  );
};

export default React.memo(InfoCard);
