/* eslint-disable prettier/prettier */
import React from "react";
import { Box, VStack, Text, HStack, Center, Icon } from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const CategoryRow = ({ category, isLast }) => {
  const count = category.CounterElements || 0;
  const min = category.Min || 0;
  const isComplete = count >= min;

  return (
    <HStack
      px="4"
      py="3"
      alignItems="center"
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="gray.100"
    >
      <VStack flex={1}>
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          color={isComplete ? "green.600" : "red.600"}
        >
          {category.CategoryValue}
        </Text>
      </VStack>
      <HStack alignItems="center" space={2}>
        <Box
          bg={isComplete ? "green.100" : "red.100"}
          px="3"
          py="1"
          rounded="full"
        >
          <Text
            fontSize="sm"
            fontWeight="bold"
            color={isComplete ? "green.600" : "red.600"}
          >
            {count}/{min}
          </Text>
        </Box>
        <Icon
          as={MaterialIcons}
          name={isComplete ? "check-circle" : "error"}
          size="sm"
          color={isComplete ? "green.500" : "red.500"}
        />
      </HStack>
    </HStack>
  );
};

const CategoriesSection = ({ categories, cardBg, headingTextColor }) => {
  return (
    <Box bg={cardBg} rounded="2xl" shadow={2} mt={4} overflow="hidden">
      <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
        <HStack alignItems="center" space={2}>
          <Center bg="blue.100" size="8" rounded="lg">
            <Icon as={MaterialIcons} name="category" size="sm" color="blue.600" />
          </Center>
          <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
            Categories
          </Text>
          <Text fontSize="xs" color="gray.400">(Geteld/Minimum)</Text>
        </HStack>
      </Box>
      <VStack>
        {categories.map((category, index) => (
          <CategoryRow
            key={index}
            category={category}
            isLast={index === categories.length - 1}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default CategoriesSection;
