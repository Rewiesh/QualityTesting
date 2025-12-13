/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, Select, CheckIcon, HStack, Center, Icon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ErrorTypePicker = ({ selectedErrorType, errorTypes, onErrorTypeChange, cardBg }) => {
  return (
    <Box bg={cardBg} rounded="xl" shadow={1} px="3" py="2" mb="2">
      <HStack alignItems="center" space={2}>
        <Center bg="red.100" size="6" rounded="md">
          <Icon as={MaterialIcons} name="error-outline" size="xs" color="red.600" />
        </Center>
        <Text fontSize="sm" fontWeight="bold" color="coolGray.800" flex={1}>
          Soort fout
        </Text>
      </HStack>
      <Select
        mt="1"
        selectedValue={selectedErrorType}
        accessibilityLabel="Kies Soort fout"
        placeholder="Kies Soort fout"
        bg="gray.50"
        borderWidth={0}
        rounded="lg"
        py="2"
        _selectedItem={{
          bg: 'red.100',
          endIcon: <CheckIcon size="4" />,
        }}
        onValueChange={onErrorTypeChange}
        fontSize="sm"
        color="coolGray.700"
      >
        {errorTypes.map((errorType, index) => (
          <Select.Item
            key={index}
            label={errorType.ErrorTypeValue}
            value={errorType.Id}
          />
        ))}
      </Select>
    </Box>
  );
};

export default React.memo(ErrorTypePicker);
