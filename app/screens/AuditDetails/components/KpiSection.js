/* eslint-disable prettier/prettier */
import React, { useCallback, memo } from "react";
import { Box, VStack, Text, HStack, Center, Icon, Select, CheckIcon, Pressable } from "native-base";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const KpiCard = memo(({ kpi, onChange, openRemarkModal }) => {
  const handleValueChange = useCallback((value) => {
    onChange(kpi, kpi.elements_auditId, value);
  }, [kpi, onChange]);

  const handleOpenRemarkModal = useCallback(() => {
    openRemarkModal();
  }, [openRemarkModal]);

  return (
    <Box bg="white" rounded="2xl" shadow={1} p="4" mb="3">
      <VStack space={2}>
        <Text fontSize="sm" fontWeight="bold" color="coolGray.800">
          {kpi.ElementLabel}
        </Text>
        <HStack alignItems="center" space={2}>
          <Select
            flex={1}
            selectedValue={kpi.ElementValue}
            accessibilityLabel="Kies waarde"
            placeholder="Kies waarde"
            bg="gray.100"
            borderWidth={0}
            rounded="xl"
            py="3"
            _selectedItem={{
              bg: "gray.200",
              endIcon: <CheckIcon size="4" />,
            }}
            onValueChange={handleValueChange}
            fontSize="sm"
            color="coolGray.700"
          >
            <Select.Item label="V - Voldoende" value="V" />
            <Select.Item label="O - Onvoldoende" value="O" />
            <Select.Item label="N - Niet van toepassing" value="N" />
            <Select.Item label="G - Goed" value="G" />
          </Select>
          {kpi.ElementValue === "O" && (
            <Pressable onPress={handleOpenRemarkModal}>
              {({ isPressed }) => (
                <Center
                  bg={isPressed ? "orange.200" : "orange.100"}
                  size="12"
                  rounded="xl"
                  style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
                >
                  <Icon as={MaterialIcons} name="edit-note" size="md" color="orange.600" />
                </Center>
              )}
            </Pressable>
          )}
        </HStack>
      </VStack>
    </Box>
  );
});

const KpiSection = ({ kpiElements, onChange, openRemarkModal, cardBg, headingTextColor }) => {
  if (!kpiElements || kpiElements.length === 0) {
    return (
      <Box bg={cardBg} rounded="2xl" shadow={2} mt={4} p="4">
        <HStack alignItems="center" space={2} mb="4">
          <Center bg="purple.100" size="8" rounded="lg">
            <Icon as={MaterialIcons} name="analytics" size="sm" color="purple.600" />
          </Center>
          <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
            KPI-metrieken
          </Text>
        </HStack>
        <Center py="6">
          <Icon as={MaterialIcons} name="inbox" size="3xl" color="gray.300" />
          <Text fontSize="sm" color="gray.400" mt="2">Geen KPI-metrieken beschikbaar</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <HStack alignItems="center" space={2} mb="3" px="1">
        <Center bg="purple.100" size="8" rounded="lg">
          <Icon as={MaterialIcons} name="analytics" size="sm" color="purple.600" />
        </Center>
        <Text fontSize="md" fontWeight="bold" color={headingTextColor}>
          KPI-metrieken
        </Text>
      </HStack>
      <VStack>
        {kpiElements.map((kpi, index) => (
          <KpiCard
            key={index}
            kpi={kpi}
            onChange={onChange}
            openRemarkModal={() => openRemarkModal(kpi)}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default KpiSection;
