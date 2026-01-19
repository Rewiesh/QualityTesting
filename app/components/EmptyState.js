/* eslint-disable prettier/prettier */
import React from 'react';
import { Center, Text, Button, ButtonText, VStack } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

/**
 * Reusable Empty State component
 */
const EmptyState = ({
  icon = 'inbox',
  iconColor = '#9ca3af',
  iconBg = '$backgroundLight200',
  title = 'Geen gegevens',
  description,
  actionLabel,
  onAction,
  ...props
}) => {
  return (
    <Center flex={1} py="$16" {...props}>
      <Center bg={iconBg} w="$20" h="$20" borderRadius="$full" mb="$4">
        <MIcon name={icon} size={48} color={iconColor} />
      </Center>
      <Text fontSize="$lg" fontWeight="$bold" color="$textDark700" mb="$1">
        {title}
      </Text>
      {description && (
        <Text fontSize="$sm" color="$textLight500" textAlign="center" px="$8" mb="$4">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          bg="$amber500"
          borderRadius="$xl"
          sx={{ ":active": { bg: "$amber600" } }}
          onPress={onAction}
        >
          <MIcon name="add" size={16} color="#fff" />
          <ButtonText color="$white" ml="$1">{actionLabel}</ButtonText>
        </Button>
      )}
    </Center>
  );
};

export default React.memo(EmptyState);
