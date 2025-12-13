/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import {
  Box,
  ScrollView,
  Button,
  Icon,
  HStack,
  useColorModeValue,
  useTheme,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import * as database from '../../services/database/database1';

import { InfoCard, SelectCard, InputCard } from './components';

const AuditResumeForm = ({ route, navigation }) => {
  const { audit } = route.params;
  const isFocused = useIsFocused();
  const theme = useTheme();

  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (isFocused) {
      fetchFormData();
    }
  }, [isFocused, audit.Id]);

  const fetchFormData = useCallback(async () => {
    try {
      const lastCompletedForm = await database.getLastCompletedForm(audit.Id);
      if (lastCompletedForm) {
        setForm({
          AreaCode: lastCompletedForm.AreaCode,
          CategoryId: lastCompletedForm.CategoryId,
          FloorId: lastCompletedForm.FloorId,
        });
        const fetchedAreas = await database.getAreasbyCategories2(lastCompletedForm.CategoryId);
        setAreas(fetchedAreas);
      }

      const [sortedCategories, sortedFloors] = await Promise.all([
        database.getCategoriesByClientSorted(audit.NameClient),
        database.getAllFloorsSorted(),
      ]);
      setCategories(sortedCategories);
      setFloors(sortedFloors);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  }, [audit.Id, audit.NameClient]);

  const onCategoryChanged = useCallback(async (value) => {
    setForm(prev => ({ ...prev, CategoryId: value }));
    try {
      const fetchedAreas = await database.getAreasbyCategories2(value);
      setAreas(fetchedAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }, []);

  const onFloorChange = useCallback((value) => {
    setForm(prev => ({ ...prev, FloorId: value }));
  }, []);

  const onAreaChange = useCallback((value) => {
    setForm(prev => ({ ...prev, AreaCode: value }));
  }, []);

  const onAreaNumberChange = useCallback((value) => {
    setForm(prev => ({ ...prev, AreaNumber: value }));
  }, []);

  const onCounterElementsChange = useCallback((text) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, CounterElements: filteredText }));
  }, []);

  const isFormCompleted = useCallback(() => {
    return form.AreaNumber && form.CounterElements && form.CategoryId && form.AreaCode && form.FloorId;
  }, [form]);

  const onSaveForm = useCallback(async () => {
    if (!isFormCompleted()) return;

    const currentDate = new Date();
    const formToSave = {
      ...form,
      AuditId: audit.Id,
      Date: new Date(
        Date.UTC(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          currentDate.getHours(),
          currentDate.getMinutes(),
          currentDate.getSeconds(),
          currentDate.getMilliseconds()
        )
      ).toISOString(),
    };

    try {
      let savedForm = await database.existFormWith(
        formToSave.CategoryId,
        formToSave.FloorId,
        formToSave.AuditId,
        formToSave.AreaCode,
        formToSave.AreaNumber
      );
      if (!savedForm) {
        savedForm = await database.saveForm(formToSave);
        await database.setAuditUnsaved(audit.Id, true);
      }
      navigation.replace('Audit Formulier', { form: savedForm });
      navigation.navigate('Fouten Lijst', { form: savedForm });
    } catch (error) {
      console.error('Error saving form:', error);
    }
  }, [form, audit.Id, isFormCompleted, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
    >
      <Box flex={1} bg={bgMain}>
        <ScrollView
          flex={1}
          _contentContainerStyle={{ p: '3', pb: '3' }}
          nestedScrollEnabled={true}
        >
          {/* Info Cards */}
          <InfoCard
            label="Klant"
            value={audit.NameClient}
            icon="business"
            color="blue"
            cardBg={cardBg}
          />
          <InfoCard
            label="Code"
            value={audit.AuditCode}
            icon="qr-code"
            color="purple"
            cardBg={cardBg}
          />

          {/* Select Cards */}
          <SelectCard
            label="Categorie"
            icon="category"
            color="green"
            placeholder="Kies Categorie"
            selectedValue={form.CategoryId}
            onValueChange={onCategoryChanged}
            items={categories}
            itemLabelKey="CategoryValue"
            itemValueKey="Id"
            cardBg={cardBg}
          />

          <SelectCard
            label="Verdieping"
            icon="layers"
            color="orange"
            placeholder="Kies Verdieping"
            selectedValue={form.FloorId}
            onValueChange={onFloorChange}
            items={floors}
            itemLabelKey="FloorValue"
            itemValueKey="Id"
            cardBg={cardBg}
          />

          <SelectCard
            label="Ruimte Omschrijving"
            icon="room"
            color="teal"
            placeholder="Kies Ruimte omschrijving"
            selectedValue={form.AreaCode}
            onValueChange={onAreaChange}
            items={areas}
            itemLabelKey="AreaValue"
            itemValueKey="Id"
            cardBg={cardBg}
          />

          {/* Input Cards */}
          <InputCard
            label="Ruimtenummer"
            icon="pin"
            color="red"
            placeholder="Voer ruimtenummer in..."
            value={form.AreaNumber}
            onChangeText={onAreaNumberChange}
            cardBg={cardBg}
          />

          <InputCard
            label="Tel-Elementen"
            icon="calculate"
            color="indigo"
            placeholder="Voer Tel-Elementen in..."
            value={form.CounterElements}
            onChangeText={onCounterElementsChange}
            keyboardType="numeric"
            cardBg={cardBg}
          />
        </ScrollView>

        {/* Sticky Footer Button */}
        <Box px="3" py="2" bg={bgMain} safeAreaBottom>
          <Button
            size="md"
            bg={isFormCompleted() ? 'fdis.500' : 'gray.300'}
            _pressed={{ bg: isFormCompleted() ? 'fdis.600' : 'gray.300' }}
            _text={{ color: 'white', fontWeight: 'bold' }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="play-arrow" size="sm" color="white" />}
            isDisabled={!isFormCompleted()}
            onPress={onSaveForm}
          >
            Audit Formulieren
          </Button>
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default AuditResumeForm;
