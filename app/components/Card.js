/* eslint-disable prettier/prettier */
import React from 'react';
import { Box, useColorModeValue } from 'native-base';
import { RADIUS, SHADOW, SPACING } from '../constants/theme';

/**
 * Reusable Card component with consistent styling
 */
const Card = ({
  children,
  variant = 'default', // 'default' | 'compact' | 'flat'
  mb = SPACING.sm,
  ...props
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  const variants = {
    default: {
      px: SPACING.md,
      py: SPACING.md,
      rounded: RADIUS.card,
      shadow: SHADOW.card,
    },
    compact: {
      px: SPACING.md,
      py: SPACING.sm,
      rounded: RADIUS.md,
      shadow: SHADOW.sm,
    },
    flat: {
      px: SPACING.md,
      py: SPACING.md,
      rounded: RADIUS.card,
      shadow: SHADOW.none,
      borderWidth: 1,
      borderColor: 'gray.100',
    },
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <Box
      bg={cardBg}
      mb={mb}
      {...variantStyles}
      {...props}
    >
      {children}
    </Box>
  );
};

export default React.memo(Card);
