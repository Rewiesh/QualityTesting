/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import {
  Button,
  ScrollView,
  Box,
  VStack,
  Text,
  TextArea,
  HStack,
  Center,
  Icon,
  useColorModeValue,
  useTheme,
} from 'native-base';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../../services/database/database1';

const AuditForm = ({ navigation, route }) => {
  const { form } = route.params;
  const theme = useTheme();
  const isFocused = useIsFocused();

  const [opmerkingen, setOpmerkingen] = useState('');
  const [category, setCategory] = useState({});
  const [floor, setFloor] = useState({});
  const [area, setArea] = useState({});
  const [errorsCount, setErrorsCount] = useState(0);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        flex={1}
        bg={bgMain}
        _contentContainerStyle={{ p: '3', pb: '3' }}
      >
        {/* Info Card */}
        <Box bg={cardBg} rounded="xl" shadow={1} overflow="hidden" mb="3">
          <HStack px="3" py="2" alignItems="center" space={2} borderBottomWidth={1} borderColor="gray.100">
            <Center bg="fdis.100" size="6" rounded="md">
              <Icon as={MaterialIcons} name="info" size="xs" color="fdis.600" />
            </Center>
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              Formulier Informatie
            </Text>
          </HStack>
          <VStack>
            {infoItems.map((item, index) => (
              <HStack
                key={index}
                px="3"
                py="2"
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={index < infoItems.length - 1 ? 1 : 0}
                borderColor="gray.50"
              >
                <HStack alignItems="center" space={2}>
                  <Center bg={`${item.color}.100`} size="6" rounded="md">
                    <Icon as={MaterialIcons} name={item.icon} size="2xs" color={`${item.color}.600`} />
                  </Center>
                  <Text fontSize="xs" color="gray.500">{item.label}</Text>
                </HStack>
                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                  {item.value || '-'}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Opmerkingen Card */}
        <Box bg={cardBg} rounded="xl" shadow={1} overflow="hidden">
          <HStack px="3" py="2" alignItems="center" space={2} borderBottomWidth={1} borderColor="gray.100">
            <Center bg="orange.100" size="6" rounded="md">
              <Icon as={MaterialIcons} name="edit-note" size="xs" color="orange.600" />
            </Center>
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              Opmerkingen
            </Text>
          </HStack>
          <Box p="3">
            <TextArea
              placeholder="Voeg opmerking toe..."
              value={opmerkingen}
              onChangeText={onChangeOpmerking}
              bg="gray.50"
              borderWidth={0}
              rounded="lg"
              fontSize="sm"
              h="24"
            />
          </Box>
        </Box>
      </ScrollView>

      {/* Sticky Footer Buttons */}
      <Box px="3" py="2" bg={bgMain} safeAreaBottom>
        <HStack space={2}>
          <Button
            flex={1}
            size="md"
            bg="fdis.500"
            _pressed={{ bg: 'fdis.600' }}
            _text={{ color: 'white', fontWeight: 'bold', fontSize: 'sm' }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="play-arrow" size="sm" color="white" />}
            onPress={onStartAuditClick}
          >
            Audit Starten
          </Button>
          <Button
            flex={1}
            size="md"
            bg="green.500"
            _pressed={{ bg: 'green.600' }}
            _text={{ color: 'white', fontWeight: 'bold', fontSize: 'sm' }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="save" size="sm" color="white" />}
            onPress={onOpslaanClick}
          >
            Opslaan
          </Button>
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default AuditForm;
