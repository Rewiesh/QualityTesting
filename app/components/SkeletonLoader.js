"/* eslint-disable prettier/prettier */
/**
 * SkeletonLoader - Shimmer loading placeholders
 */
import React, { useEffect } from 'react';
import { Box, VStack, HStack, useColorModeValue } from 'native-base';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedBox = Animated.createAnimatedComponent(Box);

// Base skeleton component with shimmer effect
const SkeletonBase = ({ width, height, rounded = 'md', style }) => {
  const shimmer = useSharedValue(0);
  const bgColor = useColorModeValue('gray.200', 'gray.700');
  const shimmerColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Box
      width={width}
      height={height}
      rounded={rounded}
      bg={bgColor}
      overflow="hidden"
      style={style}
    >
      <AnimatedBox
        style={animatedStyle}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={{
          linearGradient: {
            colors: ['transparent', shimmerColor, 'transparent'],
            start: [0, 0],
            end: [1, 0],
          },
        }}
      />
    </Box>
  );
};

// Card skeleton
export const SkeletonCard = ({ lines = 3 }) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={cardBg} rounded="xl" shadow={1} p="4" mx="4" my="2">
      <HStack space={3} alignItems="center">
        <SkeletonBase width="10" height="10" rounded="lg" />
        <VStack flex={1} space={2}>
          <SkeletonBase width="70%" height="4" />
          <SkeletonBase width="50%" height="3" />
        </VStack>
      </HStack>
      {lines > 0 && (
        <VStack mt="3" space={2}>
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBase 
              key={i} 
              width={`${100 - i * 15}%`} 
              height="3" 
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
    <VStack space={0}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </VStack>
  );
};

// Audit card skeleton
export const SkeletonAuditCard = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={cardBg} rounded="2xl" shadow={2} p="4" mx="4" my="2">
      <HStack space={4} alignItems="center">
        <SkeletonBase width="12" height="12" rounded="xl" />
        <VStack flex={1} space={2}>
          <SkeletonBase width="60%" height="4" />
          <HStack space={2}>
            <SkeletonBase width="20%" height="3" />
            <SkeletonBase width="30%" height="3" />
          </HStack>
        </VStack>
        <SkeletonBase width="16" height="6" rounded="full" />
      </HStack>
    </Box>
  );
};

// Form card skeleton
export const SkeletonFormCard = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={cardBg} rounded="xl" shadow={1} mx="4" my="1.5" overflow="hidden">
      <HStack px="3" py="2" alignItems="center" space={2} borderBottomWidth={1} borderColor="gray.100">
        <SkeletonBase width="6" height="6" rounded="md" />
        <SkeletonBase width="40%" height="4" />
      </HStack>
      <VStack p="3" space={2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <HStack key={i} justifyContent="space-between" alignItems="center">
            <HStack space={2} alignItems="center">
              <SkeletonBase width="6" height="6" rounded="md" />
              <SkeletonBase width="24" height="3" />
            </HStack>
            <SkeletonBase width="20" height="3" />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

// Stats skeleton
export const SkeletonStats = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <HStack space={2} px="4" py="3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} flex={1} bg={cardBg} rounded="lg" p="3" shadow={1}>
          <HStack alignItems="center" space={2}>
            <SkeletonBase width="8" height="8" rounded="md" />
            <VStack space={1}>
              <SkeletonBase width="8" height="5" />
              <SkeletonBase width="16" height="2" />
            </VStack>
          </HStack>
        </Box>
      ))}
    </HStack>
  );
};

// Progress bar skeleton
export const SkeletonProgressBar = () => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box bg={cardBg} rounded="xl" shadow={1} p="3" mx="4" my="2">
      <HStack justifyContent="space-between" mb="2">
        <SkeletonBase width="24" height="3" />
        <SkeletonBase width="12" height="3" />
      </HStack>
      <SkeletonBase width="100%" height="2" rounded="full" />
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
