/* eslint-disable prettier/prettier */
/**
 * AuditProgressBar - Visual progress indicator for audit completion
 */
import React, { useMemo } from 'react';
import { Box, HStack, VStack, Text, Progress, Icon, Center, useColorModeValue } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AuditProgressBar = ({ 
  categories = [], 
  compact = false,
  showDetails = true,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');

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

  if (compact) {
    return (
      <Box bg={cardBg} rounded="lg" p="2" shadow={1}>
        <HStack alignItems="center" space={2}>
          <Center bg={`${progressColor}.100`} size="6" rounded="md">
            <Icon 
              as={MaterialIcons} 
              name={progress.percentage >= 100 ? 'check-circle' : 'trending-up'} 
              size="2xs" 
              color={`${progressColor}.600`} 
            />
          </Center>
          <Box flex={1}>
            <Progress 
              value={progress.percentage} 
              size="xs"
              colorScheme={progressColor}
              bg="gray.200"
              rounded="full"
            />
          </Box>
          <Text fontSize="xs" fontWeight="bold" color={`${progressColor}.600`}>
            {progress.percentage}%
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box bg={cardBg} rounded="xl" shadow={1} p="3" mx="4" my="2">
      <HStack alignItems="center" space={2} mb="2">
        <Center bg={`${progressColor}.100`} size="8" rounded="lg">
          <Icon 
            as={MaterialIcons} 
            name={progress.percentage >= 100 ? 'check-circle' : 'trending-up'} 
            size="sm" 
            color={`${progressColor}.600`} 
          />
        </Center>
        <VStack flex={1}>
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            Audit Voortgang
          </Text>
          <Text fontSize="2xs" color="gray.500">
            {progress.completed} van {progress.total} elementen
          </Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="lg" fontWeight="bold" color={`${progressColor}.600`}>
            {progress.percentage}%
          </Text>
          {progress.remaining > 0 && (
            <Text fontSize="2xs" color="gray.400">
              nog {progress.remaining}
            </Text>
          )}
        </VStack>
      </HStack>

      <Progress 
        value={progress.percentage} 
        size="sm"
        colorScheme={progressColor}
        bg="gray.200"
        rounded="full"
      />

      {showDetails && categories.length > 0 && (
        <HStack mt="3" flexWrap="wrap" space={1}>
          {categories.slice(0, 4).map((cat, index) => {
            const catCompleted = parseInt(cat.CounterElements, 10) || 0;
            const catTotal = parseInt(cat.Min, 10) || 0;
            const catPercentage = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
            const catColor = getProgressColor(catPercentage);

            return (
              <Box 
                key={index} 
                bg={`${catColor}.50`} 
                px="2" 
                py="1" 
                rounded="md"
                mb="1"
              >
                <Text fontSize="2xs" color={`${catColor}.700`} fontWeight="medium">
                  {cat.CategoryValue?.substring(0, 15) || 'Categorie'}: {catCompleted}/{catTotal}
                </Text>
              </Box>
            );
          })}
          {categories.length > 4 && (
            <Box bg="gray.100" px="2" py="1" rounded="md" mb="1">
              <Text fontSize="2xs" color="gray.600">
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
