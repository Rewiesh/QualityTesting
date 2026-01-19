/* eslint-disable prettier/prettier */
import React from "react";
import { Box, VStack, Text, HStack, Center } from "@gluestack-ui/themed";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const CategoryRow = ({ category, isLast }) => {
  const count = category.CounterElements || 0;
  const min = category.Min || 0;
  const isComplete = count >= min;

  return (
    <HStack
      px="$4"
      py="$3"
      alignItems="center"
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="$borderLight100"
    >
      <VStack flex={1}>
        <Text 
          fontSize="$sm" 
          fontWeight="$medium" 
          color={isComplete ? "#16a34a" : "#dc2626"}
        >
          {category.CategoryValue}
        </Text>
      </VStack>
      <HStack alignItems="center" space="sm">
        <Box
          bg={isComplete ? "$green100" : "$red100"}
          px="$3"
          py="$1"
          borderRadius="$full"
        >
          <Text
            fontSize="$sm"
            fontWeight="$bold"
            color={isComplete ? "#16a34a" : "#dc2626"}
          >
            {count}/{min}
          </Text>
        </Box>
        <MIcon
          name={isComplete ? "check-circle" : "error"}
          size={16}
          color={isComplete ? "#22c55e" : "#ef4444"}
        />
      </HStack>
    </HStack>
  );
};

const CategoriesSection = ({ categories, cardBg, headingTextColor }) => {
  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} mt="$4" overflow="hidden">
      <Box px="$4" py="$3" borderBottomWidth={1} borderColor="$borderLight100">
        <HStack alignItems="center" space="sm">
          <Center bg="$blue100" w="$8" h="$8" borderRadius="$lg">
            <MIcon name="category" size={16} color="#2563eb" />
          </Center>
          <Text fontSize="$md" fontWeight="$bold" color={headingTextColor}>
            Categories
          </Text>
          <Text fontSize="$xs" color="$textLight400">(Geteld/Minimum)</Text>
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
