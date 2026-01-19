/* eslint-disable prettier/prettier */
/**
 * OfflineBanner - Shows a banner when the device is offline
 */
import React from 'react';
import { Box, HStack, Text, Pressable } from '@gluestack-ui/themed';
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

import { View } from 'react-native';

const AnimatedView = Animated.createAnimatedComponent(View);

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

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
    <AnimatedView
      style={[animatedStyle, {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: '#f97316',
        paddingTop: 44,
      }]}
    >
      <Pressable onPress={onRetry}>
        <HStack 
          px="$4" 
          py="$2" 
          alignItems="center" 
          justifyContent="center"
          space="sm"
        >
          <Animated.View style={iconStyle}>
            <MIcon 
              name="wifi-off" 
              size={16} 
              color="#fff" 
            />
          </Animated.View>
          <Text color="$white" fontWeight="$semibold" fontSize="$sm">
            Geen internetverbinding
          </Text>
          {onRetry && (
            <HStack alignItems="center" space="xs" ml="$2">
              <Text color="$white" fontSize="$xs" opacity={0.9}>
                Tik om opnieuw te proberen
              </Text>
              <MIcon 
                name="refresh" 
                size={12} 
                color="#fff" 
              />
            </HStack>
          )}
        </HStack>
      </Pressable>
    </AnimatedView>
  );
};

export default OfflineBanner;
