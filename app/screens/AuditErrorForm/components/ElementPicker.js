/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, Select, CheckIcon, HStack, Center, Icon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ElementPicker = ({ selectedElement, elements, onElementChange, cardBg }) => {
  return (
    <Box bg={cardBg} rounded="2xl" shadow={1} p="4" mb="3">
      <HStack alignItems="center" space={2} mb="3">
        <Center bg="blue.100" size="8" rounded="lg">
          <Icon as={MaterialIcons} name="category" size="sm" color="blue.600" />
        </Center>
        <Text fontSize="md" fontWeight="bold" color="coolGray.800">
          Element
        </Text>
      </HStack>
      <Select
        selectedValue={selectedElement}
        accessibilityLabel="Kies Element"
        placeholder="Kies Element"
        bg="gray.100"
        borderWidth={0}
        rounded="xl"
        py="3"
        _selectedItem={{
          bg: 'fdis.100',
          endIcon: <CheckIcon size="4" />,
        }}
        onValueChange={onElementChange}
        fontSize="sm"
        color="coolGray.700"
      >
        {elements.map((element, index) => (
          <Select.Item
            key={index}
            label={element.ElementTypeValue}
            value={element.Id}
          />
        ))}
      </Select>
    </Box>
  );
};

export default React.memo(ElementPicker);
