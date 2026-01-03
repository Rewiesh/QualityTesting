/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Box,
  ScrollView,
  Button,
  Icon,
  useColorModeValue,
  useTheme,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../../services/database/database1';

import {
  ElementPicker,
  ErrorTypePicker,
  ErrorCounter,
  LogBookSection,
  TechnicalAspectsSection,
  ImagePickerModal,
} from './components';

const AuditErrorForm = ({ navigation, route }) => {
  const theme = useTheme();
  const [error, setError] = useState(route.params?.error || {});
  const [errorTypes, setErrorTypes] = useState([]);
  const [elements, setElements] = useState([]);
  const [countError, setCountError] = useState(route.params?.error?.CountError || 0);
  const [modalLogBookVisible, setModalLogBookVisible] = useState(false);
  const [modalTechVisible, setModalTechVisible] = useState(false);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const btnColor = useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600]);

  useEffect(() => {
    fetchData();
  }, [route.params]);

  const fetchData = useCallback(async () => {
    try {
      const [fetchedErrorTypes, fetchedElements] = await Promise.all([
        database.getAllErrorType(),
        database.getElementbyArea(route.params.form.AreaCode),
      ]);
      setErrorTypes(fetchedErrorTypes);
      setElements(fetchedElements);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [route.params.form.AreaCode]);

  // Element handlers
  const getElementText = useCallback((value) => {
    const element = elements.find(e => e.Id === value);
    return element ? element.ElementTypeValue : null;
  }, [elements]);

  const onElementChange = useCallback((value) => {
    setError(prev => ({
      ...prev,
      ElementTypeId: value,
      ElementTypeText: getElementText(value),
    }));
  }, [getElementText]);

  // Error type handlers
  const getErrorTypeText = useCallback((value) => {
    const errorType = errorTypes.find(e => e.Id === value);
    return errorType ? errorType.ErrorTypeValue : null;
  }, [errorTypes]);

  const onErrorTypeChange = useCallback((value) => {
    setError(prev => ({
      ...prev,
      ErrorTypeId: value,
      ErrorTypeText: getErrorTypeText(value),
    }));
  }, [getErrorTypeText]);

  // LogBook handlers
  const onLogBookChange = useCallback((value) => {
    setError(prev => ({ ...prev, LogBook: value }));
  }, []);

  const onSaveLogBookImage = useCallback((imageUri) => {
    setError(prev => ({ ...prev, LogBookImg: imageUri }));
  }, []);

  const onDeleteLogBookImage = useCallback(() => {
    setError(prev => ({ ...prev, LogBookImg: '' }));
  }, []);

  // Technical Aspects handlers
  const onTechnicalAspectsChange = useCallback((value) => {
    setError(prev => ({ ...prev, TechnicalAspects: value }));
  }, []);

  const onSaveTechnicalAspectImage = useCallback((imageUri) => {
    setError(prev => ({ ...prev, TechnicalAspectsImg: imageUri }));
  }, []);

  const onDeleteTechnicalAspectImage = useCallback(() => {
    setError(prev => ({ ...prev, TechnicalAspectsImg: '' }));
  }, []);

  // Save error
  const saveError = useCallback(async () => {
    if (countError === 0) {
      console.log('No content to save');
      return;
    }

    const errorToSave = { ...error, CountError: countError };

    try {
      if (errorToSave.ErrorTypeId || errorToSave.ElementTypeId) {
        await database.saveError(errorToSave, route.params.form.FormId);
        await database.setAuditUnsaved(route.params.AuditId, true);
        navigation.goBack();
      } else {
        Alert.alert('Fout', 'Selecteer een element en fouttype');
      }
    } catch (ex) {
      console.error('Error during save:', ex);
      Alert.alert('Fout', ex.message);
    }
  }, [error, countError, route.params.form.FormId, route.params.AuditId, navigation]);

  return (
    <Box flex={1} bg={bgMain}>
      <ScrollView
        flex={1}
        _contentContainerStyle={{ p: '4', pb: '4' }}
        nestedScrollEnabled={true}
      >
        <ElementPicker
          selectedElement={error.ElementTypeId}
          elements={elements}
          onElementChange={onElementChange}
          cardBg={cardBg}
        />

        <ErrorTypePicker
          selectedErrorType={error.ErrorTypeId}
          errorTypes={errorTypes}
          onErrorTypeChange={onErrorTypeChange}
          cardBg={cardBg}
        />

        <ErrorCounter
          count={countError}
          setCount={setCountError}
          cardBg={cardBg}
        />

        {countError > 0 && (
          <>
            <LogBookSection
              error={error}
              onLogBookChange={onLogBookChange}
              onOpenImagePicker={() => setModalLogBookVisible(true)}
              onDeleteImage={onDeleteLogBookImage}
              cardBg={cardBg}
            />

            <TechnicalAspectsSection
              error={error}
              onTechnicalAspectsChange={onTechnicalAspectsChange}
              onOpenImagePicker={() => setModalTechVisible(true)}
              onDeleteImage={onDeleteTechnicalAspectImage}
              cardBg={cardBg}
            />
          </>
        )}
      </ScrollView>

      {/* Sticky Footer Button */}
      {countError > 0 && (
        <Box px="4" py="3" pb="6" bg={bgMain} shadow={3}>
          <Button
            size="lg"
            bg="fdis.500"
            _pressed={{ bg: 'fdis.600' }}
            _text={{ color: 'white', fontWeight: 'bold' }}
            rounded="xl"
            leftIcon={<Icon as={MaterialIcons} name="save" size="md" color="white" />}
            onPress={saveError}
          >
            Opmerking opslaan
          </Button>
        </Box>
      )}

      {/* Image Picker Modals */}
      <ImagePickerModal
        isOpen={modalLogBookVisible}
        onClose={() => setModalLogBookVisible(false)}
        title="Logboek Afbeelding"
        currentImage={error.LogBookImg}
        onSaveImage={onSaveLogBookImage}
        onDeleteImage={onDeleteLogBookImage}
        onSaveError={saveError}
        iconColor="purple"
      />

      <ImagePickerModal
        isOpen={modalTechVisible}
        onClose={() => setModalTechVisible(false)}
        title="Technische Aspecten"
        currentImage={error.TechnicalAspectsImg}
        onSaveImage={onSaveTechnicalAspectImage}
        onDeleteImage={onDeleteTechnicalAspectImage}
        onSaveError={saveError}
        iconColor="teal"
      />
    </Box>
  );
};

export default AuditErrorForm;
