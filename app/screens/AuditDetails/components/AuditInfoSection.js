/* eslint-disable prettier/prettier */
import React from "react";
import { Box, VStack, Text, HStack, Center } from "@gluestack-ui/themed";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const AuditInfoSection = ({ audit, cardBg, headingTextColor, textColor }) => {
  const infoItems = [
    { label: "Klant", value: audit.NameClient },
    { label: "Code", value: audit.AuditCode },
    { label: "Audit soort", value: audit.Type, isBadge: true },
    { label: "Locatie", value: audit.LocationClient },
  ];

  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} overflow="hidden">
      {/* Header */}
      <Box px="$4" py="$3" borderBottomWidth={1} borderColor="$borderLight100">
        <HStack alignItems="center" space="sm">
          <Center bg="$blue100" w="$8" h="$8" borderRadius="$full">
            <MIcon name="info" size={16} color="#2563eb" />
          </Center>
          <Text fontSize="$md" fontWeight="$bold" color={headingTextColor}>
            Informatie
          </Text>
        </HStack>
      </Box>

      {/* Content - Table Style like SS1 */}
      <VStack>
        {infoItems.map((item, index) => (
          <HStack
            key={index}
            px="$4"
            py="$3"
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={index < infoItems.length - 1 ? 1 : 0}
            borderColor="$borderLight100"
            bg={index % 2 === 0 ? "$white" : "$backgroundLight50"}
          >
            <Text fontSize="$sm" color="$textLight500">
              {item.label}
            </Text>
            {item.isBadge ? (
              <Box bg="$blue100" px="$3" py="$1" borderRadius="$lg">
                <Text fontSize="$sm" fontWeight="$bold" color="#2563eb">
                  {item.value || "-"}
                </Text>
              </Box>
            ) : (
              <Text fontSize="$sm" fontWeight="$semibold" color={textColor}>
                {item.value || "-"}
              </Text>
            )}
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default AuditInfoSection;
