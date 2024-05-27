import React, {useState, useEffect, useCallback} from 'react';
import {TouchableOpacity, SafeAreaView, Alert, FlatList} from 'react-native';
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
          />
        )}
        {item.type === 'TechnicalAspects' && (
          <TechnicalAspects
            countError={countError}
            error={error}
            onTechnicalAspectsChange={onTechnicalAspectsChange}
            setModalTechVisible={setModalTechVisible}
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
    <Box
      flex={1}
      _contentContainerStyle={{
        p: '2',
        mb: '50',
        pb: '75',
      }}>
      <FlatList
        data={formItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: 8,
        }}
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
      {countError > 0 && (
        <Button
          mt="2"
          mb="75"
          mr="2"
          ml="2"
          bg={useColorModeValue(theme.colors.fdis[400], theme.colors.fdis[600])}
          _text={{color: 'white'}}
          onPress={saveError}>
          Opslaan
        </Button>
      )}
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
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size="5" />,
        }}
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
        Fout Soort
      </Text>
      <Select
        selectedValue={selectedErrorType}
        minWidth="200"
        accessibilityLabel="Kies Fout Soort"
        placeholder="Kies Fout Soort"
        _selectedItem={{
          bg: 'teal.600',
          endIcon: <CheckIcon size="5" />,
        }}
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
  const decreaseCount = () => {
    if (count > 0) {
      setCount(prevCount => Number(prevCount) - 1);
    }
  };

  const increaseCount = () => {
    setCount(prevCount => Number(prevCount) + 1);
  };

  return (
    <Box width="100%">
      <Text fontSize="md" mb={1} bold>
        Aantal fout(en)
      </Text>
      <HStack justifyContent="space-between" alignItems="center">
        <IconButton
          onPress={decreaseCount}
          variant="solid"
          colorScheme="danger"
          icon={<Icon as={<MaterialIcons name="remove" />} size={5} />}
        />
        <Text fontSize="md">{count}</Text>
        <IconButton
          onPress={increaseCount}
          variant="solid"
          colorScheme="success"
          icon={<Icon as={<MaterialIcons name="add" />} size={5} />}
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
}) => {
  return countError > 0 ? (
    <Box mt={4}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="md" bold>
          Logboek
        </Text>
        <TouchableOpacity onPress={() => setModalLogBookVisible(true)}>
          <MaterialIcons name="image" size={32} color="#000" />
        </TouchableOpacity>
      </HStack>
      <TextArea
        mt={2}
        borderRadius={8}
        borderWidth={1}
        borderColor="gray.300"
        px={4}
        py={3}
        value={error.LogBook || ''}
        onChangeText={onLogBookChange}
        placeholder="Voer logboek in..."
        height={100}
        numberOfLines={4}
      />
    </Box>
  ) : null;
};

const TechnicalAspects = ({
  countError,
  error,
  onTechnicalAspectsChange,
  setModalTechVisible,
}) => {
  return countError > 0 ? (
    <Box mt={4}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontSize="md" bold>
          Technische Aspecten
        </Text>
        <TouchableOpacity onPress={() => setModalTechVisible(true)}>
          <MaterialIcons name="image" size={32} color="#000" />
        </TouchableOpacity>
      </HStack>
      <TextArea
        mt={2}
        borderRadius={8}
        borderWidth={1}
        borderColor="gray.300"
        px={4}
        py={3}
        value={error.TechnicalAspects || ''}
        onChangeText={onTechnicalAspectsChange}
        placeholder="Voer technische aspecten in...."
        height={100}
        numberOfLines={4}
      />
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
  const [selectedImage, setSelectedImage] = useState('');

  const handleSaveImage = () => {
    onSaveLogBookImage(selectedImage);
    setModalLogBookVisible(false);
  };

  const handleDeleteImage = () => {
    onDeleteLogBookImage();
    setModalLogBookVisible(false);
  };

  return (
    <Center>
      <Modal
        isOpen={modalLogBookVisible}
        onClose={() => setModalLogBookVisible(false)}
        size="xl">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Foto</Modal.Header>
          <Modal.Body>
            <PicturePicker
              onSelectImage={setSelectedImage}
              error={error}
              modalType="logBook"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={1} justifyContent="center">
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setModalLogBookVisible(false)}
                leftIcon={<Icon as={MaterialIcons} name="cancel" size="xs" />}>
                Annuleren
              </Button>
              {error.LogBookImg && (
                <Button
                  size="sm"
                  colorScheme="red"
                  onPress={handleDeleteImage}
                  leftIcon={
                    <Icon as={MaterialIcons} name="delete" size="xs" />
                  }>
                  Verwijderen
                </Button>
              )}
              <Button
                size="sm"
                onPress={handleSaveImage}
                leftIcon={<Icon as={MaterialIcons} name="save" size="xs" />}>
                Opslaan
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Center>
  );
};

const RenderModalTechnicalAspects = ({
  modalTechVisible,
  setModalTechVisible,
  error,
  onSaveTechnicalAspectImage,
  onDeleteTechnicalAspectImage,
}) => {
  const [selectedImage, setSelectedImage] = useState('');

  const handleSaveImage = () => {
    onSaveTechnicalAspectImage(selectedImage);
    setModalTechVisible(false);
  };

  const handleDeleteImage = () => {
    onDeleteTechnicalAspectImage();
    setModalTechVisible(false);
  };

  return (
    <Center>
      <Modal
        isOpen={modalTechVisible}
        onClose={() => setModalTechVisible(false)}
        size="xl" // Set to a larger size for better space management
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Foto</Modal.Header>
          <Modal.Body>
            <PicturePicker
              onSelectImage={setSelectedImage}
              error={error}
              modalType="techAspects"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={1} justifyContent="center">
              <Button
                size="sm" // Smaller button size for compact layout
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => setModalTechVisible(false)}
                leftIcon={<Icon as={MaterialIcons} name="cancel" size="xs" />}>
                Annuleren
              </Button>
              {error.TechnicalAspectsImg && (
                <Button
                  size="sm" // Smaller button size to fit within the modal
                  colorScheme="red"
                  onPress={handleDeleteImage}
                  leftIcon={
                    <Icon as={MaterialIcons} name="delete" size="xs" />
                  }>
                  Verwijderen
                </Button>
              )}
              <Button
                size="sm" // Consistent button size across all actions
                onPress={handleSaveImage}
                leftIcon={<Icon as={MaterialIcons} name="save" size="xs" />}>
                Opslaan
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Center>
  );
};

const PicturePicker = ({onSelectImage, error, modalType}) => {
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    if (error.LogBookImg && modalType === 'logBook') {
      setFilePath(error.LogBookImg);
    } else if (error.TechnicalAspectsImg && modalType === 'techAspects') {
      setFilePath(error.TechnicalAspectsImg);
    } else if (error.RemarksImg && modalType === 'remarks') {
      setFilePath(error.RemarksImg);
    }
  }, [error.LogBookImage, error.TechnicalAspectsImg, error.RemarksImg]);

  const chooseFile = () => {
    Alert.alert(
      'Add Photo',
      'Choose from',
      [
        {
          text: 'Annuleren',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Gallery',
          onPress: () => launchImagePicker('gallery'),
        },
        {
          text: 'Camera',
          onPress: () => launchImagePicker('camera'),
        },
      ],
      {cancelable: true},
    );
  };

  const launchImagePicker = type => {
    let options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };
    if (type === 'gallery') {
      launchImageLibrary(options, response => {
        handleImageResponse(response);
      });
    } else if (type === 'camera') {
      launchCamera(options, response => {
        handleImageResponse(response);
      });
    }
  };

  const handleImageResponse = response => {
    console.log('Response = ', response);

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      setFilePath(selectedImage.uri);
      onSelectImage(selectedImage.uri);
    } else {
      console.log('No image selected');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Box flex={1} alignItems="center">
        <TouchableOpacity activeOpacity={0.5} onPress={chooseFile}>
          {filePath !== '' ? (
            <Image
              source={{uri: filePath}}
              style={{width: 200, height: 200, my: 1}}
              alt="Selected Image"
            />
          ) : (
            <Text style={{padding: 10, color: 'black'}}>Toevoegen</Text>
          )}
        </TouchableOpacity>
      </Box>
    </SafeAreaView>
  );
};

export default AuditErrorForm;
