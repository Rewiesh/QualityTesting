/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center } from '@gluestack-ui/themed';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const ErrorTypePicker = ({ selectedErrorType, errorTypes, onErrorTypeChange, cardBg }) => {
  return (
    <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} px="$3" py="$2" mb="$2">
      <HStack alignItems="center" space="sm">
        <Center bg="$red100" w="$6" h="$6" borderRadius="$md">
          <MIcon name="error-outline" size={12} color="#dc2626" />
        </Center>
        <Text fontSize="$sm" fontWeight="$bold" color="$textDark800" flex={1}>
          Soort fout
        </Text>
      </HStack>
      <Box mt="$1" bg="$backgroundLight50" borderRadius="$lg" overflow="hidden">
        <Picker
          selectedValue={selectedErrorType}
          onValueChange={onErrorTypeChange}
          style={{ height: 50 }}
        >
          <Picker.Item label="Kies Soort fout" value="" />
          {errorTypes.map((errorType, index) => (
            <Picker.Item
              key={index}
              label={errorType.ErrorTypeValue}
              value={errorType.Id}
            />
          ))}
        </Picker>
      </Box>
    </Box>
  );
};

export default React.memo(ErrorTypePicker);
