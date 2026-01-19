/* eslint-disable prettier/prettier */
import React from 'react';
import { Box } from '@gluestack-ui/themed';
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
  const variants = {
    default: {
      px: `$${SPACING.md}`,
      py: `$${SPACING.md}`,
      borderRadius: '$xl',
      shadowColor: '$black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    compact: {
      px: `$${SPACING.md}`,
      py: `$${SPACING.sm}`,
      borderRadius: '$md',
      shadowColor: '$black',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    flat: {
      px: `$${SPACING.md}`,
      py: `$${SPACING.md}`,
      borderRadius: '$xl',
      borderWidth: 1,
      borderColor: '$borderLight100',
    },
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <Box
      bg="$white"
      mb={`$${mb}`}
      {...variantStyles}
      {...props}
    >
      {children}
    </Box>
  );
};

export default React.memo(Card);
