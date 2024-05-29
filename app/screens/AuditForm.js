import React, {useState, useEffect} from 'react';
import {
  KeyboardAvoidingView,
} from 'react-native';
import {
  Button,
  ScrollView,
  Box,
  VStack,
  Text,
  Select,
  CheckIcon,
  Input,
  useColorModeValue,
  useTheme,
  TextArea,
} from 'native-base';
import {useIsFocused} from '@react-navigation/native';
import * as database from '../services/database/database1';

const AuditForm = ({navigation, route}) => {
  const [opmerkingen, setOpmerkingen] = useState('');
  const [category, setCategory] = useState({});
  const [floor, setFloor] = useState({});
  const [area, setArea] = useState({});
  const [errorsCount, setErrorsCount] = useState(0);
  const {form} = route.params;
  const theme = useTheme();
  const isFocused = useIsFocused();
  const bgColor = useColorModeValue('coolGray.50', theme.colors.fdis[1100]);
  const inputBgColor = useColorModeValue('white', 'black');
  const textColor = useColorModeValue('black', 'black');
  const borderColor = useColorModeValue('gray.300', 'gray.600');  

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const categoryData = await database.getCategoryById(form.CategoryId);
      setCategory(categoryData);
      const floorData = await database.getFloorById(form.FloorId);
      setFloor(floorData);
      const areaData = await database.getAreaCategoryByCode(form.AreaCode);
      setArea(areaData);
      const errors = await database.getAllErrorByFormId(form.FormId);
      const errorCount = errors.reduce(
        (count, error) => count + parseInt(error.CountError, 10),
        0,
      );
      setErrorsCount(errorCount);
      setOpmerkingen(form.Remarks);
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  const onOpslaanClick = async () => {
    console.log(' To save form : ' + JSON.stringify(form, null, 2));
    try {
      form.Completed = 1;
      form.Remarks = opmerkingen;
      console.log('save form : ' + JSON.stringify(form, null, 2));

      await database.saveForm(form);
      await database.setAuditUnsaved(form.AuditId, true);
      const updatedAudit = await database.getAuditById(form.AuditId);
      navigation.replace('Uitgevoerde Audit', {audit: updatedAudit});
    } catch (error) {
      console.error('Error saving form', error);
    }
  };

  const onChangeOpmerking = async (opmerkingen) => {
    try{
      form.Remarks = opmerkingen;
      setOpmerkingen(opmerkingen);
      console.log('save form : ' + JSON.stringify(form, null, 2));
      await database.saveForm(form);
    } catch(error) {
      console.error('Error updating opmerking', error);
    }
  }

  const onStartAuditClick = () => {
    console.log('opmerkingen : ' + JSON.stringify(opmerkingen, null, 2));
    navigation.navigate('Fouten Lijst', {form: form});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>   
      <ScrollView
        flex={1}
        bg={bgColor}
        _contentContainerStyle={{
          p: '2',
          mb: '4',
          pb: '120',
        }}>
        <RenderInfo
          infoLabel="Categorie"
          info={category.CategoryValue}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInfo
          infoLabel="Verdieping"
          info={floor.FloorValue}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInfo
          infoLabel="Ruimte Omschrijving"
          info={area.AreaValue}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInfo
          infoLabel="Ruimtenummer"
          info={form.AreaNumber}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInfo
          infoLabel="TEL-ELEMENT"
          info={form.CounterElements}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInfo
          infoLabel="Fouten"
          info={errorsCount}
          textColor={textColor}
          borderColor={borderColor}
        />
        <RenderInput
          textColor={textColor}
          value={opmerkingen}
          onChange={onChangeOpmerking}
        />
        <Button
          mt="2"
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}
          onPress={onStartAuditClick}>
          Audit Starten
        </Button>
        <Button
          mt="2"
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}
          onPress={onOpslaanClick}>
          Opslaan
        </Button>
      </ScrollView>
    </KeyboardAvoidingView> 
  );
};

const RenderInfo = ({infoLabel, info, textColor, borderColor}) => {
  return (
    <Box borderBottomWidth="1" borderColor={borderColor} p="2" bg="white">
      <VStack space={2}>
        <Text fontWeight="bold" fontSize="md" color={textColor}>
          {infoLabel}
        </Text>
        <Text fontSize="sm" color={textColor}>
          {info}
        </Text>
      </VStack>
    </Box>
  );
};

const RenderInput = ({textColor, value, onChange}) => {
  return (
    <Box mt={4}>
      <VStack space={2}>
        <Text fontWeight="bold" fontSize="md" color={textColor}>
          Opmerkingen
        </Text>
        <TextArea
          mt={2}
          borderRadius="8"
          borderWidth="1"
          borderColor="gray.300"
          px="4"
          py="3"
          value={value}
          onChangeText={value => {
            onChange(value);
          }}
          placeholder="Voeg opmerking toe"
          height={150} // Set a fixed height for the TextArea
          numberOfLines={4} // Allows text to wrap in multiline
        />
      </VStack>
    </Box>
  );
};

export default AuditForm;
