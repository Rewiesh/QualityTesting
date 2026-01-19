/* eslint-disable prettier/prettier */
import React from 'react';
import { HStack, Center, Text } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ICON_SIZE, FONT_SIZE } from '../constants/theme';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping for gluestack
const colorMap = {
  'blue.600': '#2563eb',
  'blue.100': '$blue100',
  'orange.600': '#ea580c',
  'orange.100': '$orange100',
  'green.600': '#16a34a',
  'green.100': '$green100',
  'red.600': '#dc2626',
  'red.100': '$red100',
  'purple.600': '#9333ea',
  'purple.100': '$purple100',
};

/**
 * Reusable Card Header with icon and title
 */
const CardHeader = ({
  icon,
  iconColor = 'blue.600',
  iconBg = 'blue.100',
  title,
  rightElement,
  compact = false,
  ...props
}) => {
  const iconSize = compact ? 12 : 16;
  const bgColor = colorMap[iconBg] || '$blue100';
  const iColor = colorMap[iconColor] || '#2563eb';

  return (
    <HStack alignItems="center" justifyContent="space-between" {...props}>
      <HStack alignItems="center" space="sm">
        <Center bg={bgColor} w={compact ? '$5' : '$6'} h={compact ? '$5' : '$6'} borderRadius={compact ? '$sm' : '$md'}>
          <MIcon name={icon} size={iconSize} color={iColor} />
        </Center>
        <Text fontSize={compact ? '$xs' : '$sm'} fontWeight="$bold" color="$textDark800">
          {title}
        </Text>
      </HStack>
      {rightElement}
    </HStack>
  );
};

export default React.memo(CardHeader);
