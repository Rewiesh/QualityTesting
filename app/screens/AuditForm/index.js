/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { Button, ButtonText, Box, VStack, Text, Textarea, TextareaInput, HStack, Center } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../../services/database/database1';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  blue: { bg: '$blue100', icon: '#2563eb' },
  purple: { bg: '$purple100', icon: '#9333ea' },
  green: { bg: '$green100', icon: '#16a34a' },
  orange: { bg: '$orange100', icon: '#ea580c' },
  teal: { bg: '$teal100', icon: '#0d9488' },
  red: { bg: '$red100', icon: '#dc2626' },
};

const AuditForm = ({ navigation, route }) => {
  const { form } = route.params;
  const isFocused = useIsFocused();

  const [opmerkingen, setOpmerkingen] = useState('');
  const [category, setCategory] = useState({});
  const [floor, setFloor] = useState({});
  const [area, setArea] = useState({});
  const [errorsCount, setErrorsCount] = useState(0);

  // Colors
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const textColor = '$textDark800';

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = useCallback(async () => {
    try {
      const [categoryData, floorData, areaData, errors] = await Promise.all([
        database.getCategoryById(form.CategoryId),
        database.getFloorById(form.FloorId),
        database.getAreaCategoryByCode(form.AreaCode),
        database.getAllErrorByFormId(form.FormId),
      ]);

      setCategory(categoryData);
      setFloor(floorData);
      setArea(areaData);
      setErrorsCount(errors.reduce((count, error) => count + parseInt(error.CountError, 10), 0));
      setOpmerkingen(form.Remarks);
    } catch (error) {
      console.error('Error loading data', error);
    }
  }, [form]);

  const onOpslaanClick = useCallback(async () => {
    try {
      form.Completed = 1;
      form.Remarks = opmerkingen;
      await database.saveForm(form);
      await database.setAuditUnsaved(form.AuditId, true);
      const updatedAudit = await database.getAuditById(form.AuditId);
      navigation.replace('Uitgevoerde Audit', { audit: updatedAudit });
    } catch (error) {
      console.error('Error saving form', error);
    }
  }, [form, opmerkingen, navigation]);

  const onChangeOpmerking = useCallback(async (value) => {
    try {
      form.Remarks = value;
      setOpmerkingen(value);
      await database.saveForm(form);
    } catch (error) {
      console.error('Error updating opmerking', error);
    }
  }, [form]);

  const onStartAuditClick = useCallback(() => {
    navigation.navigate('Fouten Lijst', { form });
  }, [navigation, form]);

  const infoItems = [
    { label: 'Categorie', value: category.CategoryValue, icon: 'category', color: 'blue' },
    { label: 'Verdieping', value: floor.FloorValue, icon: 'layers', color: 'purple' },
    { label: 'Ruimte Omschrijving', value: area.AreaValue, icon: 'room', color: 'green' },
    { label: 'Ruimtenummer', value: form.AreaNumber, icon: 'pin', color: 'orange' },
    { label: 'Tel-element', value: form.CounterElements, icon: 'calculate', color: 'teal' },
    { label: 'Fouten', value: errorsCount, icon: 'error-outline', color: 'red' },
  ];

  return (
    <Box flex={1} bg={bgMain}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} overflow="hidden" mb="$3">
            <HStack px="$3" py="$2" alignItems="center" space="sm" borderBottomWidth={1} borderColor="$borderLight100">
              <Center bg="$amber100" w="$6" h="$6" borderRadius="$md">
                <MIcon name="info" size={12} color="#f59e0b" />
              </Center>
              <Text fontSize="$sm" fontWeight="$bold" color={textColor}>
                Formulier Informatie
              </Text>
            </HStack>
            <VStack>
              {infoItems.map((item, index) => {
                const colors = colorMap[item.color] || colorMap.blue;
                return (
                  <HStack
                    key={index}
                    px="$3"
                    py="$2"
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottomWidth={index < infoItems.length - 1 ? 1 : 0}
                    borderColor="$borderLight50"
                  >
                    <HStack alignItems="center" space="sm">
                      <Center bg={colors.bg} w="$6" h="$6" borderRadius="$md">
                        <MIcon name={item.icon} size={10} color={colors.icon} />
                      </Center>
                      <Text fontSize="$xs" color="$textLight500">{item.label}</Text>
                    </HStack>
                    <Text fontSize="$xs" fontWeight="$semibold" color={textColor}>
                      {item.value || '-'}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Box>

          {/* Opmerkingen Card */}
          <Box bg={cardBg} borderRadius="$xl" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.1} shadowRadius={2} overflow="hidden">
            <HStack px="$3" py="$2" alignItems="center" space="sm" borderBottomWidth={1} borderColor="$borderLight100">
              <Center bg="$orange100" w="$6" h="$6" borderRadius="$md">
                <MIcon name="edit-note" size={12} color="#ea580c" />
              </Center>
              <Text fontSize="$sm" fontWeight="$bold" color={textColor}>
                Opmerkingen
              </Text>
            </HStack>
            <Box p="$3">
              <Textarea bg="$backgroundLight50" borderWidth={0} borderRadius="$lg" h={96}>
                <TextareaInput
                  placeholder="Voeg opmerking toe..."
                  value={opmerkingen}
                  onChangeText={onChangeOpmerking}
                  fontSize="$sm"
                />
              </Textarea>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Footer Buttons - Outside KeyboardAvoidingView */}
      <Box px="$3" py="$3" pb="$6" bg={cardBg} shadowColor="$black" shadowOffset={{ width: 0, height: -2 }} shadowOpacity={0.1} shadowRadius={3}>
        <HStack space="sm">
          <Button
            flex={1}
            size="md"
            bg="$amber500"
            sx={{ ':active': { bg: '$amber600' } }}
            borderRadius="$xl"
            onPress={onStartAuditClick}
          >
            <MIcon name="play-arrow" size={16} color="#fff" />
            <ButtonText color="$white" fontWeight="$bold" fontSize="$sm" ml="$1">Audit Starten</ButtonText>
          </Button>
          <Button
            flex={1}
            size="md"
            bg="$green500"
            sx={{ ':active': { bg: '$green600' } }}
            borderRadius="$xl"
            onPress={onOpslaanClick}
          >
            <MIcon name="save" size={16} color="#fff" />
            <ButtonText color="$white" fontWeight="$bold" fontSize="$sm" ml="$1">Opslaan</ButtonText>
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default AuditForm;
