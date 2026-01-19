/* eslint-disable prettier/prettier */
import React, { useCallback, memo, useState } from "react";
import { Box, VStack, Text, HStack, Center, Pressable, Modal, ModalBackdrop, ModalContent, ModalBody } from "@gluestack-ui/themed";
import { FlatList } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// KPI value options
const KPI_OPTIONS = [
  { label: "V - Voldoende", value: "V" },
  { label: "O - Onvoldoende", value: "O" },
  { label: "N - Niet van toepassing", value: "N" },
  { label: "G - Goed", value: "G" },
];

const getOptionLabel = (value) => {
  const option = KPI_OPTIONS.find(o => o.value === value);
  return option ? option.label : "Kies waarde";
};

const KpiCard = memo(({ kpi, onChange, openRemarkModal }) => {
  const [showModal, setShowModal] = useState(false);
  const cardBg = '$white';
  const textColor = '$textDark800';

  const handleValueChange = useCallback((value) => {
    onChange(kpi, kpi.elements_auditId, value);
    setShowModal(false);
  }, [kpi, onChange]);

  const handleOpenRemarkModal = useCallback(() => {
    openRemarkModal();
  }, [openRemarkModal]);

  return (
    <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} p="$4" mb="$3">
      <VStack space="sm">
        <Text fontSize="$sm" fontWeight="$bold" color={textColor}>
          {kpi.ElementLabel}
        </Text>
        <HStack alignItems="center" space="sm">
          <Pressable flex={1} onPress={() => setShowModal(true)}>
            <HStack
              bg="$backgroundLight100"
              borderRadius="$xl"
              px="$4"
              py="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="$sm" color={kpi.ElementValue ? "$textDark800" : "$textLight400"}>
                {getOptionLabel(kpi.ElementValue)}
              </Text>
              <MIcon name="arrow-drop-down" size={24} color="#6b7280" />
            </HStack>
          </Pressable>
          {kpi.ElementValue === "O" && (
            <Pressable onPress={handleOpenRemarkModal}>
              {({ pressed }) => (
                <Center
                  bg={pressed ? "$orange200" : "$orange100"}
                  w="$12"
                  h="$12"
                  borderRadius="$xl"
                  style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}
                >
                  <MIcon name="edit-note" size={20} color="#ea580c" />
                </Center>
              )}
            </Pressable>
          )}
        </HStack>
      </VStack>

      {/* Selection Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalBackdrop />
        <ModalContent borderRadius="$2xl" maxWidth={300}>
          <ModalBody p="$0">
            <FlatList
              data={KPI_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleValueChange(item.value)}>
                  {({ pressed }) => (
                    <HStack
                      px="$4"
                      py="$4"
                      bg={pressed ? "$backgroundLight100" : (kpi.ElementValue === item.value ? "$blue50" : "$white")}
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottomWidth={1}
                      borderColor="$borderLight100"
                    >
                      <Text fontSize="$md" color={kpi.ElementValue === item.value ? "$blue600" : "$textDark800"}>
                        {item.label}
                      </Text>
                      {kpi.ElementValue === item.value && (
                        <MIcon name="check" size={20} color="#2563eb" />
                      )}
                    </HStack>
                  )}
                </Pressable>
              )}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
});

const KpiSection = ({ kpiElements, onChange, openRemarkModal, cardBg, headingTextColor }) => {
  if (!kpiElements || kpiElements.length === 0) {
    return (
      <Box bg={cardBg} borderRadius="$2xl" shadowColor="$black" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.15} shadowRadius={3} mt="$4" p="$4">
        <HStack alignItems="center" space="sm" mb="$4">
          <Center bg="$purple100" w="$8" h="$8" borderRadius="$lg">
            <MIcon name="analytics" size={16} color="#9333ea" />
          </Center>
          <Text fontSize="$md" fontWeight="$bold" color={headingTextColor}>
            KPI-metrieken
          </Text>
        </HStack>
        <Center py="$6">
          <MIcon name="inbox" size={48} color="#d1d5db" />
          <Text fontSize="$sm" color="$textLight400" mt="$2">Geen KPI-metrieken beschikbaar</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box mt="$4">
      <HStack alignItems="center" space="sm" mb="$3" px="$1">
        <Center bg="$purple100" w="$8" h="$8" borderRadius="$lg">
          <MIcon name="analytics" size={16} color="#9333ea" />
        </Center>
        <Text fontSize="$md" fontWeight="$bold" color={headingTextColor}>
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
