import React, {useState, useEffect} from 'react';
import {KeyboardAvoidingView, Keyboard} from 'react-native';
import {
  Button,
  FlatList,
  Box,
  VStack,
  Text,
  Select,
  CheckIcon,
  Input,
  useColorModeValue,
  useTheme,
} from 'native-base';
import * as database from '../services/database/database1';
import {useIsFocused} from '@react-navigation/native';

const AuditResumeForm = ({route, navigation}) => {
  const {audit} = route.params;
  const {clientName} = route.params;
  const {user} = route.params;
  const isFocused = useIsFocused();
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const theme = useTheme();
  const bgColor = useColorModeValue('coolGray.50', theme.colors.fdis[1100]);
  const inputBgColor = useColorModeValue('white', 'black');
  const textColor = useColorModeValue('black', 'black');
  const borderColor = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    if (isFocused) {
      fetchFormData();
    }
  }, [isFocused, audit.Id]);

  const fetchFormData = async () => {
    try {
      const lastCompletedForm = await database.getLastCompletedForm(audit.Id);
      if (lastCompletedForm != null) {
        const updatedForm = {
          ...form,
          AreaCode: lastCompletedForm.AreaCode,
          CategoryId: lastCompletedForm.CategoryId,
          FloorId: lastCompletedForm.FloorId,
        };
        setForm(updatedForm);
        invalidateAreas(lastCompletedForm.CategoryId);
      }
      const sortedCategories = await database.getCategoriesByClientSorted(
        audit.NameClient,
      );
      setCategories(sortedCategories);

      const sortedFloors = await database.getAllFloorsSorted();
      setFloors(sortedFloors);
    } catch (error) {
      console.error(error);
    }
  };

  const invalidateAreas = async categoryId => {
    const areas = await database.getAreasbyCategories2(categoryId);
    setAreas(areas);
  };

  const onCategoryChanged = async value => {
    const updatedForm = {...form, CategoryId: value};
    setForm(updatedForm);

    try {
      const fetchedAreas = await database.getAreasbyCategories2(value);
      setAreas(fetchedAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const onFloorChange = async value => {
    const updatedForm = {...form, FloorId: value};
    setForm(updatedForm);
  };

  const onAreaChange = async value => {
    const updatedForm = {...form, AreaCode: value};
    setForm(updatedForm);
  };

  const isFormCompleted = () => {
    return (
      form.AreaNumber &&
      form.CounterElements &&
      form.CategoryId &&
      form.AreaCode &&
      form.FloorId
    );
  };

  const onSaveForm = async () => {
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
          currentDate.getMilliseconds(),
        ),
      ).toISOString(),
    };

    try {
      let savedForm = await database.existFormWith(
        formToSave.CategoryId,
        formToSave.FloorId,
        formToSave.AuditId,
        formToSave.AreaCode,
        formToSave.AreaNumber,
      );
      if (!savedForm) {
        savedForm = await database.saveForm(formToSave);
        await database.setAuditUnsaved(audit.Id, true);
      }

      navigation.replace('Audit Formulier', {form: savedForm});
      navigation.navigate('Fouten Lijst', {form: savedForm});
    } catch (error) {
      console.error('Error saving form', error);
    }
  };

  const renderFormItem = ({item}) => {
    switch (item.type) {
      case 'ClientInfo':
        return (
          <ClientInfo
            clientName={audit.NameClient}
            textColor={textColor}
            borderColor={borderColor}
          />
        );
      case 'AuditCodeInfo':
        return (
          <AuditCodeInfo
            auditCode={audit.AuditCode}
            textColor={textColor}
            borderColor={borderColor}
          />
        );
      case 'CategoryPicker':
        return (
          <CategoryPicker
            categories={categories}
            selectedCategory={form.CategoryId}
            onCategoryChange={onCategoryChanged}
            textColor={textColor}
          />
        );
      case 'FloorPicker':
        return (
          <FloorPicker
            floors={floors}
            selectedFloor={form.FloorId}
            onFloorChange={onFloorChange}
            textColor={textColor}
          />
        );
      case 'AreaDescriptionPicker':
        return (
          <AreaDescriptionPicker
            areas={areas}
            selectedArea={form.AreaCode}
            onAreaChange={onAreaChange}
            textColor={textColor}
          />
        );
      case 'AreaNumber':
        return (
          <AreaNumber form={form} setForm={setForm} textColor={textColor} />
        );
      case 'CounterElements':
        return (
          <CounterElements
            form={form}
            setForm={setForm}
            textColor={textColor}
          />
        );
      default:
        return null;
    }
  };

  const formItems = [
    {type: 'ClientInfo'},
    {type: 'AuditCodeInfo'},
    {type: 'CategoryPicker'},
    {type: 'FloorPicker'},
    {type: 'AreaDescriptionPicker'},
    {type: 'AreaNumber'},
    {type: 'CounterElements'},
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}>
      <FlatList
        data={formItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFormItem}
        contentContainerStyle={{padding: 16}}
        style={{flex: 1, backgroundColor: bgColor}}
      />
      <Box padding={4} backgroundColor={bgColor}>
        <Button
          isDisabled={!isFormCompleted()}
          mt="2"
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}
          onPress={onSaveForm}>
          Audit Formulieren
        </Button>
      </Box>
    </KeyboardAvoidingView>
  );
};

const ClientInfo = ({clientName, textColor, borderColor}) => {
  return (
    <Box borderBottomWidth="1" borderColor={borderColor} p="2" bg="white">
      <VStack space={2}>
        <Text fontWeight="bold" fontSize="md" color={textColor}>
          Klant
        </Text>
        <Text fontSize="sm" color={textColor}>
          {clientName}
        </Text>
      </VStack>
    </Box>
  );
};

const AuditCodeInfo = ({auditCode, textColor, borderColor}) => {
  return (
    <Box borderBottomWidth="1" borderColor={borderColor} p="2" bg="white">
      <VStack space={2}>
        <Text fontWeight="bold" fontSize="md" color={textColor}>
          Code
        </Text>
        <Text fontSize="sm" color={textColor}>
          {auditCode}
        </Text>
      </VStack>
    </Box>
  );
};

const CategoryPicker = ({
  selectedCategory,
  categories,
  onCategoryChange,
  textColor,
}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Categorie
      </Text>
      <Select
        selectedValue={selectedCategory}
        minWidth="200"
        accessibilityLabel="Kies Categorie"
        placeholder="Kies Categorie"
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size="5" />,
        }}
        mt={1}
        onValueChange={onCategoryChange}>
        {categories.map((category, index) => (
          <Select.Item
            key={index}
            label={category.CategoryValue}
            value={category.Id}
          />
        ))}
      </Select>
    </Box>
  );
};

const FloorPicker = ({selectedFloor, floors, onFloorChange, textColor}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Verdiepingen
      </Text>
      <Select
        selectedValue={selectedFloor}
        minWidth="200"
        accessibilityLabel="Kies Verdieping"
        placeholder="Kies Verdieping"
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size="5" />,
        }}
        mt={1}
        onValueChange={onFloorChange}>
        {floors.map((floor, index) => (
          <Select.Item key={index} label={floor.FloorValue} value={floor.Id} />
        ))}
      </Select>
    </Box>
  );
};

const AreaDescriptionPicker = ({
  selectedArea,
  areas,
  onAreaChange,
  textColor,
}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Ruimte Omschrijving
      </Text>
      <Select
        selectedValue={selectedArea}
        minWidth="200"
        accessibilityLabel="Kies Ruimte omschrijving"
        placeholder="Kies Ruimte omschrijving"
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size="5" />,
        }}
        mt={1}
        onValueChange={onAreaChange}>
        {areas.map((area, index) => (
          <Select.Item key={index} label={area.AreaValue} value={area.Id} />
        ))}
      </Select>
    </Box>
  );
};

const AreaNumber = ({form, setForm, textColor}) => {
  return (
    <Box>
      <Text fontSize="md" bold mb="1">
        Ruimtenummer
      </Text>
      <Input
        style={{height: 40, backgroundColor: '#fff', color: textColor}}
        onChangeText={AreaNumber => setForm({...form, AreaNumber})}
        value={form.AreaNumber}
        placeholder="Voer ruimtenummer in..."
      />
    </Box>
  );
};

const CounterElements = ({form, setForm, textColor}) => {
  const handleTextChange = text => {
    const filteredText = text.replace(/[^0-9]/g, '');
    setForm({...form, CounterElements: filteredText});
  };

  return (
    <Box>
      <Text fontSize="md" bold mb="1">
        Tel-Elementen
      </Text>
      <Input
        keyboardType="numeric"
        style={{height: 40, backgroundColor: '#fff', color: textColor}}
        onChangeText={handleTextChange}
        value={form.CounterElements}
        placeholder="Voer Tel-Elementen in..."
      />
    </Box>
  );
};

export default AuditResumeForm;
