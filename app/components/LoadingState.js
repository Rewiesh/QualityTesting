/* eslint-disable prettier/prettier */
import React from 'react';
import { Center, Spinner, Text, VStack, Box, HStack } from '@gluestack-ui/themed';

/**
 * Reusable Loading State component
 */
export const LoadingSpinner = ({
  text = 'Laden...',
  size = 'large',
  color = '$amber500',
  ...props
}) => {
  return (
    <Center flex={1} {...props}>
      <VStack space="md" alignItems="center">
        <Spinner size={size} color={color} />
        <Text fontSize="$md" color="$textLight500">
          {text}
        </Text>
      </VStack>
    </Center>
  );
};

/**
 * Skeleton Card for loading states
 * Note: gluestack doesn't have built-in Skeleton, using simple placeholder
 */
export const SkeletonCard = ({ lines = 2, ...props }) => {
  return (
    <Box bg="$white" borderRadius="$xl" p="$4" mb="$2" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} {...props}>
      <HStack space="md" alignItems="center">
        <Box w="$10" h="$10" borderRadius="$lg" bg="$backgroundLight200" />
        <VStack flex={1} space="sm">
          {Array.from({ length: lines }).map((_, index) => (
            <Box key={index} h="$3" bg="$backgroundLight200" borderRadius="$sm" w={index === 0 ? '$full' : '$3/4'} />
          ))}
        </VStack>
      </HStack>
    </Box>
  );
};

/**
 * Skeleton List for loading multiple items
 */
export const SkeletonList = ({ count = 3, ...props }) => {
  return (
    <VStack space="sm" p="$4" {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </VStack>
  );
};

/**
 * Full screen loading overlay
 */
export const LoadingOverlay = ({
  visible,
  text = 'Even geduld...',
  ...props
}) => {
  if (!visible) return null;

  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(255,255,255,0.9)"
      zIndex={999}
      {...props}
    >
      <VStack space="md" alignItems="center" bg="$white" p="$6" borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 3 }} shadowOpacity={0.15} shadowRadius={6}>
        <Spinner size="large" color="$amber500" />
        <Text fontSize="$md" color="$textLight600" fontWeight="$medium">
          {text}
        </Text>
      </VStack>
    </Center>
  );
};

export default {
  LoadingSpinner,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay,
};
