/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, Select, CheckIcon, HStack, Center, Icon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ErrorTypePicker = ({ selectedErrorType, errorTypes, onErrorTypeChange, cardBg }) => {
  return (
    <Box bg={cardBg} rounded="2xl" shadow={1} p="4" mb="3">
      <HStack alignItems="center" space={2} mb="3">
        <Center bg="red.100" size="8" rounded="lg">
          <Icon as={MaterialIcons} name="error-outline" size="sm" color="red.600" />
        </Center>
        <Text fontSize="md" fontWeight="bold" color="coolGray.800">
          Soort fout
        </Text>
      </HStack>
      <Select
        selectedValue={selectedErrorType}
        accessibilityLabel="Kies Soort fout"
        placeholder="Kies Soort fout"
        bg="gray.100"
        borderWidth={0}
        rounded="xl"
        py="3"
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
