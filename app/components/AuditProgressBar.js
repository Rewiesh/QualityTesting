/* eslint-disable prettier/prettier */
/**
 * AuditProgressBar - Visual progress indicator for audit completion
 */
import React, { useMemo } from 'react';
import { Box, HStack, VStack, Text, Progress, ProgressFilledTrack, Center } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping for gluestack
const colorMap = {
  green: { bg: '$green100', text: '#16a34a', fill: '$green500' },
  blue: { bg: '$blue100', text: '#2563eb', fill: '$blue500' },
  yellow: { bg: '$yellow100', text: '#ca8a04', fill: '$yellow500' },
  orange: { bg: '$orange100', text: '#ea580c', fill: '$orange500' },
  red: { bg: '$red100', text: '#dc2626', fill: '$red500' },
};

const AuditProgressBar = ({ 
  categories = [], 
  compact = false,
  showDetails = true,
}) => {
  const cardBg = '$white';
  const textColor = '$textDark800';

  const progress = useMemo(() => {
    if (!categories || categories.length === 0) {
      return { percentage: 0, completed: 0, total: 0, remaining: 0 };
    }

    const total = categories.reduce((sum, cat) => sum + (parseInt(cat.Min, 10) || 0), 0);
    const completed = categories.reduce((sum, cat) => sum + (parseInt(cat.CounterElements, 10) || 0), 0);
    const percentage = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
    const remaining = Math.max(total - completed, 0);

    return { percentage, completed, total, remaining };
  }, [categories]);

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 50) return 'yellow';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  const progressColor = getProgressColor(progress.percentage);

  const colors = colorMap[progressColor] || colorMap.blue;

  if (compact) {
    return (
      <Box bg={cardBg} borderRadius="$lg" p="$2" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2}>
        <HStack alignItems="center" space="sm">
          <Center bg={colors.bg} w="$6" h="$6" borderRadius="$md">
            <MIcon 
              name={progress.percentage >= 100 ? 'check-circle' : 'trending-up'} 
              size={12} 
              color={colors.text} 
            />
          </Center>
          <Box flex={1}>
            <Progress value={progress.percentage} size="xs" bg="$backgroundLight200" borderRadius="$full">
              <ProgressFilledTrack bg={colors.fill} />
            </Progress>
          </Box>
          <Text fontSize="$xs" fontWeight="$bold" color={colors.text}>
            {progress.percentage}%
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$3" mx="$4" my="$2">
      <HStack alignItems="center" space="sm" mb="$2">
        <Center bg={colors.bg} w="$8" h="$8" borderRadius="$lg">
          <MIcon 
            name={progress.percentage >= 100 ? 'check-circle' : 'trending-up'} 
            size={16} 
            color={colors.text} 
          />
        </Center>
        <VStack flex={1}>
          <Text fontSize="$sm" fontWeight="$bold" color={textColor}>
            Audit Voortgang
          </Text>
          <Text fontSize="$2xs" color="$textLight500">
            {progress.completed} van {progress.total} elementen
          </Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="$lg" fontWeight="$bold" color={colors.text}>
            {progress.percentage}%
          </Text>
          {progress.remaining > 0 && (
            <Text fontSize="$2xs" color="$textLight400">
              nog {progress.remaining}
            </Text>
          )}
        </VStack>
      </HStack>

      <Progress value={progress.percentage} size="sm" bg="$backgroundLight200" borderRadius="$full">
        <ProgressFilledTrack bg={colors.fill} />
      </Progress>

      {showDetails && categories.length > 0 && (
        <HStack mt="$3" flexWrap="wrap" space="xs">
          {categories.slice(0, 4).map((cat, index) => {
            const catCompleted = parseInt(cat.CounterElements, 10) || 0;
            const catTotal = parseInt(cat.Min, 10) || 0;
            const catPercentage = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
            const catColor = getProgressColor(catPercentage);
            const catColors = colorMap[catColor] || colorMap.blue;

            return (
              <Box 
                key={index} 
                bg={catColors.bg} 
                px="$2" 
                py="$1" 
                borderRadius="$md"
                mb="$1"
              >
                <Text fontSize="$2xs" color={catColors.text} fontWeight="$medium">
                  {cat.CategoryValue?.substring(0, 15) || 'Categorie'}: {catCompleted}/{catTotal}
                </Text>
              </Box>
            );
          })}
          {categories.length > 4 && (
            <Box bg="$backgroundLight100" px="$2" py="$1" borderRadius="$md" mb="$1">
              <Text fontSize="$2xs" color="$textLight600">
                +{categories.length - 4} meer
              </Text>
            </Box>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default AuditProgressBar;
