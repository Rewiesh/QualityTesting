/* eslint-disable prettier/prettier */
/**
 * OfflineBanner - Shows a banner when the device is offline
 */
import React from 'react';
import { Box, HStack, Text, Icon, Pressable } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedBox = Animated.createAnimatedComponent(Box);

const OfflineBanner = ({ isOffline, onRetry }) => {
  const translateY = useSharedValue(isOffline ? 0 : -100);
  const pulse = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(isOffline ? 0 : -100, {
      damping: 15,
      stiffness: 100,
    });

    if (isOffline) {
      // Pulse animation for the icon
      pulse.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      );
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.1]) }],
  }));

  if (!isOffline) return null;

  return (
    <AnimatedBox
      style={animatedStyle}
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={999}
      bg="orange.500"
      safeAreaTop
    >
      <Pressable onPress={onRetry}>
        <HStack 
          px="4" 
          py="2" 
          alignItems="center" 
          justifyContent="center"
          space={2}
        >
          <Animated.View style={iconStyle}>
            <Icon 
              as={MaterialIcons} 
              name="wifi-off" 
              size="sm" 
              color="white" 
            />
          </Animated.View>
          <Text color="white" fontWeight="semibold" fontSize="sm">
            Geen internetverbinding
          </Text>
          {onRetry && (
            <HStack alignItems="center" space={1} ml="2">
              <Text color="white" fontSize="xs" opacity={0.9}>
                Tik om opnieuw te proberen
              </Text>
              <Icon 
                as={MaterialIcons} 
                name="refresh" 
                size="xs" 
                color="white" 
              />
            </HStack>
          )}
        </HStack>
      </Pressable>
    </AnimatedBox>
  );
};

export default OfflineBanner;
