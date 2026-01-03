/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Box,
  HStack,
  Text,
  Pressable,
  FlatList,
  VStack,
  Icon,
  Center,
  Button,
  useColorModeValue,
} from 'native-base';
import * as database from '../../services/database/database1';
import { ShowToast } from '../../services/Util';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AuditErrorList = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { form } = route.params;
  const [errors, setErrors] = useState([]);

  // Colors
  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('coolGray.800', 'white');

  useEffect(() => {
    if (isFocused) {
      renderAddButton();
      loadErrors();
    }
  }, [isFocused, form.FormId]);

  const loadErrors = useCallback(async () => {
    try {
      const fetchedErrors = await database.getAllErrorByFormId(form.FormId);
      setErrors(fetchedErrors.filter(error => error.CountError > 0));
    } catch (error) {
      console.error('Error loading errors:', error);
    }
  }, [form.FormId]);

  const deleteError = useCallback((error) => {
    Alert.alert(
      'Bevestig Verwijdering',
      'Weet u zeker dat u deze fout wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              setErrors(prev => prev.filter(e => e.ErrorId !== error.ErrorId));
              await database.deleteError(error);
              ShowToast({
                status: 'success',
                message: 'Fout succesvol verwijderd.',
                bgColor: bgMain,
                textColor: textColor,
              });
            } catch (err) {
              console.error('Error deleting error:', err);
              ShowToast({
                status: 'error',
                message: 'Fout bij verwijderen.',
                bgColor: bgMain,
                textColor: textColor,
              });
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, [bgMain, textColor]);

  const editError = useCallback((error) => {
    navigation.navigate('Opmerkingen', { error, form });
  }, [navigation, form]);

  const addError = useCallback(() => {
    navigation.navigate('Opmerkingen', { form });
  }, [navigation, form]);

  const renderAddButton = useCallback(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={addError} px="3" _pressed={{ opacity: 0.5 }}>
          <Icon as={MaterialIcons} name="add" color="white" size="2xl" />
        </Pressable>
      ),
    });
  }, [navigation, addError]);

  const renderErrorRow = useCallback(({ item }) => (
    <Pressable onPress={() => editError(item)}>
      {({ isPressed }) => (
        <Box
          bg={cardBg}
          mx="4"
          my="1.5"
          rounded="2xl"
          shadow={1}
          overflow="hidden"
          style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
        >
          <HStack alignItems="center" p="4">
            <Center bg="red.100" size="12" rounded="xl" mr="3">
              <Icon as={MaterialIcons} name="error-outline" size="md" color="red.600" />
            </Center>
            <VStack flex={1}>
              <Text fontSize="md" fontWeight="bold" color="coolGray.800">
                {item.ElementTypeText}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {item.ErrorTypeText}
              </Text>
              <HStack alignItems="center" space={1} mt="1">
                <Icon as={MaterialIcons} name="pin" size="xs" color="orange.500" />
                <Text fontSize="xs" color="orange.500" fontWeight="bold">
                  {item.CountError} fout(en)
                </Text>
              </HStack>
            </VStack>
            <HStack space={2}>
              <Pressable onPress={() => deleteError(item)}>
                {({ isPressed: delPressed }) => (
                  <Center
                    bg={delPressed ? 'red.100' : 'red.50'}
                    size="10"
                    rounded="xl"
                  >
                    <Icon as={MaterialIcons} name="delete" size="sm" color="red.500" />
                  </Center>
                )}
              </Pressable>
              <Center bg="gray.100" size="10" rounded="xl">
                <Icon as={MaterialIcons} name="chevron-right" size="sm" color="gray.400" />
              </Center>
            </HStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  ), [cardBg, editError, deleteError]);

  const renderEmptyState = useCallback(() => (
    <Center flex={1} py="20">
      <Center bg="green.100" size="20" rounded="full" mb="4">
        <Icon as={MaterialIcons} name="check-circle" size="4xl" color="green.500" />
      </Center>
      <Text fontSize="lg" fontWeight="bold" color="coolGray.700" mb="1">
        Geen fouten gevonden
      </Text>
      <Text fontSize="sm" color="gray.500" textAlign="center" px="8" mb="4">
        Er zijn nog geen fouten geregistreerd voor dit formulier.
      </Text>
      <Button
        bg="fdis.500"
        _pressed={{ bg: 'fdis.600' }}
        rounded="xl"
        leftIcon={<Icon as={MaterialIcons} name="add" size="sm" color="white" />}
        onPress={addError}
      >
        Fout Toevoegen
      </Button>
    </Center>
  ), [addError]);

  const renderHeader = useCallback(() => (
    errors.length > 0 ? (
      <HStack px="4" py="3" alignItems="center" justifyContent="space-between">
        <Text fontSize="sm" color="gray.500">
          Geregistreerde fouten
        </Text>
        <Box bg="red.100" px="3" py="1" rounded="full">
          <Text fontSize="xs" fontWeight="bold" color="red.600">
            {errors.length} fout(en)
          </Text>
        </Box>
      </HStack>
    ) : null
  ), [errors.length]);

  return (
    <Box flex={1} bg={bgMain}>
      <FlatList
        data={errors}
        renderItem={renderErrorRow}
        keyExtractor={item => item.ErrorId.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default AuditErrorList;
