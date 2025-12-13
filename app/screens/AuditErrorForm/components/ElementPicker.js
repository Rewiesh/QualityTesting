/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, Select, CheckIcon, HStack, Center, Icon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ElementPicker = ({ selectedElement, elements, onElementChange, cardBg }) => {
  return (
    <Box bg={cardBg} rounded="xl" shadow={1} px="3" py="2" mb="2">
      <HStack alignItems="center" space={2}>
        <Center bg="blue.100" size="6" rounded="md">
          <Icon as={MaterialIcons} name="category" size="xs" color="blue.600" />
        </Center>
        <Text fontSize="sm" fontWeight="bold" color="coolGray.800" flex={1}>
          Element
        </Text>
      </HStack>
      <Select
        mt="1"
        selectedValue={selectedElement}
        accessibilityLabel="Kies Element"
        placeholder="Kies Element"
        bg="gray.50"
        borderWidth={0}
        rounded="lg"
        py="2"
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
