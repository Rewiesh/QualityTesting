/* eslint-disable prettier/prettier */
import React from 'react';
import { Center, Text, Icon, Button, VStack, useColorModeValue } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * Reusable Empty State component
 */
const EmptyState = ({
  icon = 'inbox',
  iconColor = 'gray.400',
  iconBg = 'gray.100',
  title = 'Geen gegevens',
  description,
  actionLabel,
  onAction,
  ...props
}) => {
  const textColor = useColorModeValue('coolGray.700', 'white');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Center flex={1} py="16" {...props}>
      <Center bg={iconBg} size="20" rounded="full" mb="4">
        <Icon as={MaterialIcons} name={icon} size="4xl" color={iconColor} />
      </Center>
      <Text fontSize="lg" fontWeight="bold" color={textColor} mb="1">
        {title}
      </Text>
      {description && (
        <Text fontSize="sm" color={subtextColor} textAlign="center" px="8" mb="4">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          bg="fdis.500"
          _pressed={{ bg: 'fdis.600' }}
          rounded="xl"
          leftIcon={<Icon as={MaterialIcons} name="add" size="sm" color="white" />}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Center>
  );
};

export default React.memo(EmptyState);
