/* eslint-disable prettier/prettier */
import React from 'react';
import { HStack, Center, Icon, Text } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ICON_SIZE, FONT_SIZE } from '../constants/theme';

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
  const iconSize = compact ? ICON_SIZE.cardHeaderSmall : ICON_SIZE.cardHeader;
  const fontSize = compact ? FONT_SIZE.cardLabel : FONT_SIZE.cardTitle;

  return (
    <HStack alignItems="center" justifyContent="space-between" {...props}>
      <HStack alignItems="center" space={2}>
        <Center bg={iconBg} size={iconSize} rounded={compact ? 'sm' : 'md'}>
          <Icon
            as={MaterialIcons}
            name={icon}
            size={compact ? '2xs' : 'xs'}
            color={iconColor}
          />
        </Center>
        <Text fontSize={fontSize} fontWeight="bold" color="coolGray.800">
          {title}
        </Text>
      </HStack>
      {rightElement}
    </HStack>
  );
};

export default React.memo(CardHeader);
