import React, {useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  Icon,
  Tooltip,
  Toast,
  useColorModeValue,
} from 'native-base';
import * as database from '../services/database/database1';
import {ShowToast} from '../services/Util';
import {useIsFocused} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AuditErrorList = ({route, navigation}) => {
  const isFocused = useIsFocused();
  const {form} = route.params;
  const [errors, setErrors] = useState([]);
  const bgColor = useColorModeValue('coolGray.100', 'gray.700');
  const textColor = useColorModeValue('darkText', 'lightText');

  useEffect(() => {
    if (isFocused) {
      renderAddButton();
      loadErrors();
    }
  }, [isFocused, form.FormId]);

  const loadErrors = async () => {
    try {
      const fetchedErrors = await database.getAllErrorByFormId(form.FormId);
      setErrors(fetchedErrors.filter(error => error.CountError > 0));
    } catch (error) {
      console.error('Error loading errors:', error);
    }
  };  

  const deleteError = async (error) => {
    Alert.alert(
      'Bevestig Verwijdering', 
      'Weet u zeker dat u deze fout wilt verwijderen?', 
      [
        {
          text: 'Annuleren',
          onPress: () => console.log('Deletion cancelled'),
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          onPress: async () => {
            try {
              setErrors(errors =>
                errors.filter(e => e.ErrorId !== error.ErrorId),
              );
              ShowToast({
                status: 'success',
                message: 'Fout succesvol verwijderd.',
                bgColor: bgColor,
                textColor: textColor,
              });
              const result = await database.deleteError(error);
            } catch (error) {
              console.error('Error deleting error:', error);
              ShowToast({
                status: 'error',
                message: 'Fout succesvol verwijderd.',
                bgColor: bgColor,
                textColor: textColor,
              });
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const editError = error => {
    navigation.navigate('Opmerkingen', {
      error: error,
      form: form,
    });
  };

  const addError = () => {
    navigation.navigate('Opmerkingen', {
      form: form,
    });
  };

  const renderAddButton = () => {
    navigation.setOptions({
      headerRight: () => (
        <Tooltip label="Add Error" openDelay={500} placement="left" hasArrow>
          <Pressable
            onPress={addError}
            px="3"
            _pressed={{
              opacity: 0.5,
            }}
            _hover={{
              bg: 'primary.600', 
            }}>
            <Icon
              as={MaterialIcons}
              name="add"
              color="white"
              size="2xl" 
            />
          </Pressable>
        </Tooltip>
      ),
    });
  };

  const renderErrorRow = ({item}) => (
    <Pressable onPress={() => editError(item)}>
      {({isHovered, isPressed}) => (
        <Box
          borderBottomWidth="1"
          py="3"
          borderColor="coolGray.300"
          bg={isPressed ? 'coolGray.200' : 'coolGray.100'}
          px="4"
          rounded="md"
          style={{transform: [{scale: isPressed ? 0.96 : 1}]}}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1}>
              <Text
                bold
                color="coolGray.800"
                fontSize="md"
                _dark={{color: 'warmGray.200'}}>
                {item.ElementTypeText}
              </Text>
              <Text note fontSize="xs">
                {item.ErrorTypeText}
              </Text>
            </VStack>
            <Pressable onPress={() => deleteError(item)}>
              <Icon as={MaterialIcons} name="delete" color="red.500" size="xl" />
            </Pressable>
          </HStack>
        </Box>
      )}
    </Pressable>
  );


  return (
    <FlatList
      data={errors}
      renderItem={renderErrorRow}
      keyExtractor={item => item.ErrorId.toString()}
      contentContainerStyle={{
        flexGrow: 1,
        // paddingBottom: useColorModeValue(100, 150),
        paddingBottom: 120,
      }}
    />
  );
};

export default AuditErrorList;
