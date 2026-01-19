/* eslint-disable prettier/prettier */
/**
 * SkeletonLoader - Shimmer loading placeholders
 */
import React, { useEffect } from 'react';
import { Box, VStack, HStack } from '@gluestack-ui/themed';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { View } from 'react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

// Border radius mapping
const radiusMap = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Base skeleton component with shimmer effect
const SkeletonBase = ({ width, height, rounded = 'md', style }) => {
  const shimmer = useSharedValue(0);
  const bgColor = '#e5e7eb'; // gray.200

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.5, 1, 0.5]
    );
    return { opacity };
  });

  const borderRadius = radiusMap[rounded] || 8;

  return (
    <AnimatedView
      style={[animatedStyle, {
        width: typeof width === 'string' && width.includes('%') ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        borderRadius,
        backgroundColor: bgColor,
        overflow: 'hidden',
      }, style]}
    >
      <Box
        w={width}
        h={height}
        borderRadius={`$${rounded}`}
        bg="$backgroundLight200"
      />
    </AnimatedView>
  );
};

// Card skeleton
export const SkeletonCard = ({ lines = 3 }) => {
  const cardBg = '$white';

  return (
    <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$4" mx="$4" my="$2">
      <HStack space="md" alignItems="center">
        <SkeletonBase width={40} height={40} rounded="lg" />
        <VStack flex={1} space="sm">
          <SkeletonBase width="70%" height={16} />
          <SkeletonBase width="50%" height={12} />
        </VStack>
      </HStack>
      {lines > 0 && (
        <VStack mt="$3" space="sm">
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBase 
              key={i} 
              width={`${100 - i * 15}%`} 
              height={12} 
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

// List skeleton
export const SkeletonList = ({ count = 5, lines = 2 }) => {
  return (
    <VStack>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </VStack>
  );
};

// Audit card skeleton
export const SkeletonAuditCard = () => {
  const cardBg = '$white';

  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} p="$4" mx="$4" my="$2">
      <HStack space="md" alignItems="center">
        <SkeletonBase width={48} height={48} rounded="xl" />
        <VStack flex={1} space="sm">
          <SkeletonBase width="60%" height={16} />
          <HStack space="sm">
            <SkeletonBase width="20%" height={12} />
            <SkeletonBase width="30%" height={12} />
          </HStack>
        </VStack>
        <SkeletonBase width={64} height={24} rounded="full" />
      </HStack>
    </Box>
  );
};

// Form card skeleton
export const SkeletonFormCard = () => {
  const cardBg = '$white';

  return (
    <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} mx="$4" my="$1.5" overflow="hidden">
      <HStack px="$3" py="$2" alignItems="center" space="sm" borderBottomWidth={1} borderColor="$borderLight100">
        <SkeletonBase width={24} height={24} rounded="md" />
        <SkeletonBase width="40%" height={16} />
      </HStack>
      <VStack p="$3" space="sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <HStack key={i} justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <SkeletonBase width={24} height={24} rounded="md" />
              <SkeletonBase width={96} height={12} />
            </HStack>
            <SkeletonBase width={80} height={12} />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

// Stats skeleton
export const SkeletonStats = () => {
  const cardBg = '$white';

  return (
    <HStack space="sm" px="$4" py="$3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} flex={1} bg={cardBg} borderRadius="$lg" p="$3" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
          <HStack alignItems="center" space="sm">
            <SkeletonBase width={32} height={32} rounded="md" />
            <VStack space="xs">
              <SkeletonBase width={32} height={20} />
              <SkeletonBase width={64} height={8} />
            </VStack>
          </HStack>
        </Box>
      ))}
    </HStack>
  );
};

// Progress bar skeleton
export const SkeletonProgressBar = () => {
  const cardBg = '$white';

  return (
    <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$3" mx="$4" my="$2">
      <HStack justifyContent="space-between" mb="$2">
        <SkeletonBase width={96} height={12} />
        <SkeletonBase width={48} height={12} />
      </HStack>
      <SkeletonBase width="100%" height={8} rounded="full" />
    </Box>
  );
};

export default {
  Base: SkeletonBase,
  Card: SkeletonCard,
  List: SkeletonList,
  AuditCard: SkeletonAuditCard,
  FormCard: SkeletonFormCard,
  Stats: SkeletonStats,
  ProgressBar: SkeletonProgressBar,
};
