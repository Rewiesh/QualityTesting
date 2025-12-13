/* eslint-disable prettier/prettier */
import React from "react";
import { Box, VStack, Text, HStack, Center, Icon } from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const AuditInfoSection = ({ audit, cardBg, headingTextColor, textColor }) => {
  const infoItems = [
    { label: "Klant", value: audit.NameClient },
    { label: "Code", value: audit.AuditCode },
    { label: "Audit soort", value: audit.Type, isBadge: true },
    { label: "Locatie", value: audit.LocationClient },
  ];

  return (
    <Box bg={cardBg} rounded="2xl" shadow={2} overflow="hidden">
      {/* Header */}
      <Box px="4" py="3" borderBottomWidth={1} borderColor="gray.100">
        <HStack alignItems="center" space={2}>
          <Center bg="blue.100" size="8" rounded="full">
            <Icon as={MaterialIcons} name="info" size="sm" color="blue.600" />
          </Center>
          <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
            Informatie
          </Text>
        </HStack>
      </Box>

      {/* Content - Table Style like SS1 */}
      <VStack>
        {infoItems.map((item, index) => (
          <HStack
            key={index}
            px="4"
            py="3"
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={index < infoItems.length - 1 ? 1 : 0}
            borderColor="gray.100"
            bg={index % 2 === 0 ? "white" : "gray.50"}
          >
            <Text fontSize="sm" color="gray.500">
              {item.label}
            </Text>
            {item.isBadge ? (
              <Box bg="blue.100" px="3" py="1" rounded="lg">
                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                  {item.value || "-"}
                </Text>
              </Box>
            ) : (
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
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
