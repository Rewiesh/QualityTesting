/* eslint-disable prettier/prettier */
import React from 'react';
import { Center, Spinner, Text, VStack, Box, HStack, Skeleton } from 'native-base';

/**
 * Reusable Loading State component
 */
export const LoadingSpinner = ({
  text = 'Laden...',
  size = 'lg',
  color = 'fdis.500',
  ...props
}) => {
  return (
    <Center flex={1} {...props}>
      <VStack space={3} alignItems="center">
        <Spinner size={size} color={color} />
        <Text fontSize="md" color="gray.500">
          {text}
        </Text>
      </VStack>
    </Center>
  );
};

/**
 * Skeleton Card for loading states
 */
export const SkeletonCard = ({ lines = 2, ...props }) => {
  return (
    <Box bg="white" rounded="xl" p="4" mb="2" shadow={1} {...props}>
      <HStack space={3} alignItems="center">
        <Skeleton size="10" rounded="lg" />
        <VStack flex={1} space={2}>
          <Skeleton.Text lines={lines} />
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
    <VStack space={2} p="4" {...props}>
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
      <VStack space={4} alignItems="center" bg="white" p="6" rounded="2xl" shadow={3}>
        <Spinner size="lg" color="fdis.500" />
        <Text fontSize="md" color="gray.600" fontWeight="medium">
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
