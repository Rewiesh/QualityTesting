/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { Box, Text, HStack, Center, Pressable, Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody } from '@gluestack-ui/themed';
import { FlatList } from 'react-native';
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
  const [showModal, setShowModal] = useState(false);
  const colors = colorMap[color] || colorMap.blue;

  const selectedItem = items.find(item => item[itemValueKey] === selectedValue);
  const displayText = selectedItem ? selectedItem[itemLabelKey] : placeholder;

  const handleSelect = (value) => {
    onValueChange(value);
    setShowModal(false);
  };

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
      <Pressable onPress={() => setShowModal(true)}>
        <HStack
          mt="$1"
          bg="$backgroundLight50"
          borderRadius="$md"
          px="$3"
          py="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize="$sm" color={selectedValue ? "$textDark800" : "$textLight400"}>
            {displayText}
          </Text>
          <MIcon name="arrow-drop-down" size={20} color="#6b7280" />
        </HStack>
      </Pressable>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent borderRadius="$2xl" maxWidth={350} maxHeight={400}>
          <ModalHeader borderBottomWidth={1} borderColor="$borderLight100">
            <Text fontSize="$md" fontWeight="$bold">{label}</Text>
          </ModalHeader>
          <ModalBody p="$0">
            <FlatList
              data={items}
              keyExtractor={(item, index) => String(item[itemValueKey] || index)}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelect(item[itemValueKey])}>
                  {({ pressed }) => (
                    <HStack
                      px="$4"
                      py="$3"
                      bg={pressed ? "$backgroundLight100" : (selectedValue === item[itemValueKey] ? "$blue50" : "$white")}
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottomWidth={1}
                      borderColor="$borderLight50"
                    >
                      <Text fontSize="$sm" color={selectedValue === item[itemValueKey] ? "$blue600" : "$textDark800"}>
                        {item[itemLabelKey]}
                      </Text>
                      {selectedValue === item[itemValueKey] && (
                        <MIcon name="check" size={18} color="#2563eb" />
                      )}
                    </HStack>
                  )}
                </Pressable>
              )}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default React.memo(SelectCard);
