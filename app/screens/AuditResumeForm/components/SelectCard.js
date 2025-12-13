/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, Text, HStack, Center, Icon, Select, CheckIcon } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SelectCard = ({
  label,
  icon,
  color,
  placeholder,
  selectedValue,
  onValueChange,
  items,
  itemLabelKey,
  itemValueKey,
  cardBg,
}) => {
  return (
    <Box bg={cardBg} rounded="lg" shadow={1} px="3" py="2" mb="1.5">
      <HStack alignItems="center" space={2}>
        <Center bg={`${color}.100`} size="5" rounded="sm">
          <Icon as={MaterialIcons} name={icon} size="2xs" color={`${color}.600`} />
        </Center>
        <Text fontSize="xs" fontWeight="bold" color="coolGray.800">
          {label}
        </Text>
      </HStack>
      <Select
        mt="1"
        selectedValue={selectedValue}
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        bg="gray.50"
        borderWidth={0}
        rounded="md"
        py="1.5"
        _selectedItem={{
          bg: 'fdis.100',
          endIcon: <CheckIcon size="4" />,
        }}
        onValueChange={onValueChange}
        fontSize="sm"
        color="coolGray.700"
      >
        {items.map((item, index) => (
          <Select.Item
            key={index}
            label={item[itemLabelKey]}
            value={item[itemValueKey]}
          />
        ))}
      </Select>
    </Box>
  );
};

export default React.memo(SelectCard);
