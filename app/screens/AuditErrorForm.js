import React, {useState, useEffect, useCallback} from 'react';
import {TouchableOpacity, SafeAreaView, Alert} from 'react-native';
import {
  Button,
  Box,
  Text,
  Select,
  CheckIcon,
  Modal,
  HStack,
  Icon,
  Center,
  Image,
  IconButton,
  TextArea,
  useColorModeValue,
  useTheme,
  SectionList,
} from 'native-base';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../services/database/database1';

const AuditErrorForm = ({navigation, route}) => {
  const theme = useTheme();
  const [error, setError] = useState(route.params?.error || {});
  const [errorTypes, setErrorTypes] = useState([]);
  const [elements, setElements] = useState([]);
  const [countError, setCountError] = useState(0);
  const [modalLogBookVisible, setModalLogBookVisible] = useState(false);
  const [modalTechVisible, setModalTechVisible] = useState(false);
  const [modalRemarksVisible, setModalRemarksVisible] = useState(false);
  const backgroundColor = useColorModeValue(
    'coolGray.50',
    theme.colors.fdis[1100],
  );
  const cardBackgroundColor = useColorModeValue(
    'gray.100',
    theme.colors.fdis[900],
  );
  const headingTextColor = useColorModeValue('coolGray.800', 'black');
  const textColor = useColorModeValue('coolGray.800', 'black');
  const btnColor = useColorModeValue(
    theme.colors.fdis[400],
    theme.colors.fdis[600],
  );

  useEffect(() => {
    fetchData();
    console.log('new/Edit error :' + JSON.stringify(error, null, 2));
  }, [route.params]);

  const fetchData = async () => {
    try {
      const fetchedErrorTypes = await database.getAllErrorType();
      setErrorTypes(fetchedErrorTypes);
      const fetchedElements = await database.getElementbyArea(
        route.params.form.AreaCode,
      );
      setElements(fetchedElements);
      if (route.params?.error) {
        setCountError(route.params.error.CountError);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getElementText = value => {
    const element = elements.find(e => e.Id === value);
    return element ? element.ElementTypeValue : null;
  };

  const onElementChange = value => {
    const updatedError = {
      ...error,
      ElementTypeId: value,
      ElementTypeText: getElementText(value),
    };
    setError(updatedError);
  };

  const getErrorTypeText = value => {
    const errorType = errorTypes.find(e => e.Id === value);
    return errorType ? errorType.ErrorTypeValue : null;
  };

  const onErrorTypeChange = value => {
    const updatedError = {
      ...error,
      ErrorTypeId: value,
      ErrorTypeText: getErrorTypeText(value),
    };
    setError(updatedError);
  };

  const onLogBookChange = value => {
    const updatedError = {
      ...error,
      LogBook: value,
    };
    setError(updatedError);
  };

  const onTechnicalAspectsChange = value => {
    const updatedError = {
      ...error,
      TechnicalAspects: value,
    };
    setError(updatedError);
  };

  const onSaveLogBookImage = imageUri => {
    const updatedError = {
      ...error,
      LogBookImg: imageUri,
    };
    setError(updatedError);
    console.log(
      'Error after adding logbook image :' + JSON.stringify(error, null, 2),
    );
  };

  const onDeleteLogBookImage = () => {
    const updatedError = {
      ...error,
      LogBookImg: '',
    };
    setError(updatedError);
    console.log(
      'Error after deleting logbook image :' + JSON.stringify(error, null, 2),
    );
  };

  const onSaveTechnicalAspectImage = imageUri => {
    const updatedError = {
      ...error,
      TechnicalAspectsImg: imageUri,
    };
    setError(updatedError);
    console.log(
      'Error after adding TechnicalAspectsImg image :' +
        JSON.stringify(error, null, 2),
    );
  };

  const onDeleteTechnicalAspectImage = () => {
    const updatedError = {
      ...error,
      TechnicalAspectsImg: '',
    };
    setError(updatedError);
    console.log(
      'Error after deleting TechnicalAspectsImg image :' +
        JSON.stringify(error, null, 2),
    );
  };

  const saveError = useCallback(async () => {
    console.log('Attempting to save error', error);
    if (countError === 0) {
      console.log('No content to save');
      return;
    }
    error.CountError = countError;
    console.log('Saving error:', JSON.stringify(error, null, 2));

    try {
      let savedError;
      if (error.ErrorTypeId || error.ElementTypeId) {
        savedError = await database.saveError(error, route.params.form.FormId);
      } else {
        console.log('Required data for saving is missing');
        return;
      }

      await database.setAuditUnsaved(route.params.AuditId, true);
      console.log('Error saved, navigating back');
      navigation.goBack();
    } catch (ex) {
      console.error('Error during save:', ex);
      Alert.alert('Error', ex.message);
    }
  }, [
    error,
    countError,
    route.params.form.FormId,
    route.params.AuditId,
    navigation,
  ]);

  const renderItem = ({item}) => {
    return (
      <Box key={item.id}>
        {item.type === 'ElementPicker' && (
          <ElementPicker
            elements={elements}
            selectedElement={error.ElementTypeId}
            onElementChange={onElementChange}
          />
        )}
        {item.type === 'ErrorTypePicker' && (
          <ErrorTypePicker
            errorTypes={errorTypes}
            selectedErrorType={error.ErrorTypeId}
            onErrorTypeChange={onErrorTypeChange}
          />
        )}
        {item.type === 'ErrorCounter' && (
          <ErrorCounter count={countError} setCount={setCountError} />
        )}
        {item.type === 'LogBook' && (
          <LogBook
            countError={countError}
            error={error}
            onLogBookChange={onLogBookChange}
            setModalLogBookVisible={setModalLogBookVisible}
            onDeleteLogBookImage={onDeleteLogBookImage}
          />
        )}
        {item.type === 'TechnicalAspects' && (
          <TechnicalAspects
            countError={countError}
            error={error}
            onTechnicalAspectsChange={onTechnicalAspectsChange}
            setModalTechVisible={setModalTechVisible}
            onDeleteTechnicalAspectImage={onDeleteTechnicalAspectImage}
          />
        )}
      </Box>
    );
  };

  const formItems = [
    {id: '1', type: 'ElementPicker'},
    {id: '2', type: 'ErrorTypePicker'},
    {id: '3', type: 'ErrorCounter'},
    {id: '4', type: 'LogBook'},
    {id: '5', type: 'TechnicalAspects'},
  ];

  return (
    <Box flex={1} _contentContainerStyle={{p: '2', mb: '50', pb: '75'}}>
      <SectionList
        sections={[{title: 'Form', data: formItems}]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 8}}
        ListFooterComponent={
          countError > 0 && (
            <Button
              // mt="2"
              mb="120"
              // mr="2"
              // ml="2"
              bg={useColorModeValue(
                theme.colors.fdis[400],
                theme.colors.fdis[600],
              )}
              _text={{color: 'white'}}
              onPress={saveError}>
              Opslaan
            </Button>
          )
        }
      />
      <RenderModalLogBook
        modalLogBookVisible={modalLogBookVisible}
        setModalLogBookVisible={setModalLogBookVisible}
        error={error}
        onSaveLogBookImage={onSaveLogBookImage}
        onDeleteLogBookImage={onDeleteLogBookImage}
      />
      <RenderModalTechnicalAspects
        modalTechVisible={modalTechVisible}
        setModalTechVisible={setModalTechVisible}
        error={error}
        onSaveTechnicalAspectImage={onSaveTechnicalAspectImage}
        onDeleteTechnicalAspectImage={onDeleteTechnicalAspectImage}
      />
    </Box>
  );
};

const ElementPicker = ({selectedElement, elements, onElementChange}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Element
      </Text>
      <Select
        selectedValue={selectedElement}
        minWidth="200"
        accessibilityLabel="Kies Element"
        placeholder="Kies Element"
        _selectedItem={{bg: 'teal.600', endIcon: <CheckIcon size="5" />}}
        mt={1}
        onValueChange={onElementChange}>
        {elements.map((element, index) => (
          <Select.Item
            key={index}
            label={element.ElementTypeValue}
            value={element.Id}
          />
        ))}
      </Select>
    </Box>
  );
};

const ErrorTypePicker = ({
  selectedErrorType,
  errorTypes,
  onErrorTypeChange,
}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Soort fout
      </Text>
      <Select
        selectedValue={selectedErrorType}
        minWidth="200"
        accessibilityLabel="Kies Soort fout"
        placeholder="Kies Soort fout"
        _selectedItem={{bg: 'teal.600', endIcon: <CheckIcon size="5" />}}
        mt={1}
        onValueChange={onErrorTypeChange}>
        {errorTypes.map((errorType, index) => (
          <Select.Item
            key={index}
            label={errorType.ErrorTypeValue}
            value={errorType.Id}
          />
        ))}
      </Select>
    </Box>
  );
};

const ErrorCounter = ({count, setCount}) => {
  return (
    <Box>
      <Text fontSize="md" mb="1" bold>
        Aantal fouten
      </Text>
      <HStack space={2} justifyContent="space-between" alignItems="center">
        <IconButton
          variant="outline"
          _icon={{as: MaterialIcons, name: 'remove', size: 'md'}}
          colorScheme="danger"
          onPress={() =>
            setCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0))
          }
        />
        <Text>{count}</Text>
        <IconButton
          variant="outline"
          colorScheme="success"
          _icon={{as: MaterialIcons, name: 'add', size: 'md'}}
          onPress={() => setCount(prevCount => prevCount + 1)}
        />
      </HStack>
    </Box>
  );
};

const LogBook = ({
  countError,
  error,
  onLogBookChange,
  setModalLogBookVisible,
  onDeleteLogBookImage,
}) => {
  return countError > 0 ? (
    <Box>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="md" bold>
          Logboek
        </Text>
        <TouchableOpacity onPress={() => setModalLogBookVisible(true)}>
          <MaterialIcons name="image" size={32} color="#000" />
        </TouchableOpacity>
      </HStack>
      <TextArea
        placeholder="Voer hier uw logboekgegevens in"
        value={error.LogBook}
        onChangeText={onLogBookChange}
      />
      {error.LogBookImg && (
        <Center mt={2}>
          <Image
            source={{uri: error.LogBookImg}}
            alt="Logboek afbeelding"
            size="xl"
            resizeMode="contain"
          />
          <IconButton
            mt={2}
            _icon={{
              as: MaterialIcons,
              name: 'delete',
              size: 'md',
              color: 'red.500',
            }}
            onPress={() => onDeleteLogBookImage()}
          />
        </Center>
      )}
    </Box>
  ) : null;
};

const TechnicalAspects = ({
  countError,
  error,
  onTechnicalAspectsChange,
  setModalTechVisible,
  onDeleteTechnicalAspectImage,
}) => {
  return countError > 0 ? (
    <Box>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="md" bold>
          Technische Aspecten
        </Text>
        <TouchableOpacity onPress={() => setModalTechVisible(true)}>
          <MaterialIcons name="image" size={32} color="#000" />
        </TouchableOpacity>
      </HStack>
      <TextArea
        placeholder="Voer hier uw technische aspecten in"
        value={error.TechnicalAspects}
        onChangeText={onTechnicalAspectsChange}
      />
      {error.TechnicalAspectsImg && (
        <Center mt={2}>
          <Image
            source={{uri: error.TechnicalAspectsImg}}
            alt="Technische aspecten afbeelding"
            size="xl"
            resizeMode="contain"
          />
          <IconButton
            mt={2}
            _icon={{
              as: MaterialIcons,
              name: 'delete',
              size: 'md',
              color: 'red.500',
            }}
            onPress={() => onDeleteTechnicalAspectImage()}
          />
        </Center>
      )}
    </Box>
  ) : null;
};

const RenderModalLogBook = ({
  modalLogBookVisible,
  setModalLogBookVisible,
  error,
  onSaveLogBookImage,
  onDeleteLogBookImage,
}) => {
  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: false,
    });
    if (result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      onSaveLogBookImage(imageUri);
    }
  };

  const handleSelectFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
    });
    if (result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      onSaveLogBookImage(imageUri);
    }
  };

  return (
    <Modal
      isOpen={modalLogBookVisible}
      onClose={() => setModalLogBookVisible(false)}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Voeg afbeelding toe</Modal.Header>
        <Modal.Body>
          <Button
            onPress={handleTakePhoto}
            leftIcon={<Icon as={MaterialIcons} name="camera" />}>
            Maak een foto
          </Button>
          <Button
            mt="2"
            onPress={handleSelectFromGallery}
            leftIcon={<Icon as={MaterialIcons} name="photo-library" />}>
            Kies uit galerij
          </Button>
          {error.LogBookImg && (
            <Center mt={2}>
              <Image
                source={{uri: error.LogBookImg}}
                alt="Logboek afbeelding"
                size="xl"
                resizeMode="contain"
              />
              <IconButton
                mt={2}
                _icon={{
                  as: MaterialIcons,
                  name: 'delete',
                  size: 'md',
                  color: 'red.500',
                }}
                onPress={() => onDeleteLogBookImage()}
              />
            </Center>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

const RenderModalTechnicalAspects = ({
  modalTechVisible,
  setModalTechVisible,
  error,
  onSaveTechnicalAspectImage,
  onDeleteTechnicalAspectImage,
}) => {
  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: false,
    });
    if (result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      onSaveTechnicalAspectImage(imageUri);
    }
  };

  const handleSelectFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
    });
    if (result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      onSaveTechnicalAspectImage(imageUri);
    }
  };

  return (
    <Modal isOpen={modalTechVisible} onClose={() => setModalTechVisible(false)}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Voeg afbeelding toe</Modal.Header>
        <Modal.Body>
          <Button
            onPress={handleTakePhoto}
            leftIcon={<Icon as={MaterialIcons} name="camera" />}>
            Maak een foto
          </Button>
          <Button
            mt="2"
            onPress={handleSelectFromGallery}
            leftIcon={<Icon as={MaterialIcons} name="photo-library" />}>
            Kies uit galerij
          </Button>
          {error.TechnicalAspectsImg && (
            <Center mt={2}>
              <Image
                source={{uri: error.TechnicalAspectsImg}}
                alt="Technische aspecten afbeelding"
                size="xl"
                resizeMode="contain"
              />
              <IconButton
                mt={2}
                _icon={{
                  as: MaterialIcons,
                  name: 'delete',
                  size: 'md',
                  color: 'red.500',
                }}
                onPress={() => onDeleteTechnicalAspectImage()}
              />
            </Center>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default AuditErrorForm;
