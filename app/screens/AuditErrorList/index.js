/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Box, HStack, Text, Pressable, VStack, Center, Button, ButtonText } from '@gluestack-ui/themed';
import { FlatList } from 'react-native';
import * as database from '../../services/database/database1';
import { ShowToast } from '../../services/Util';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

const AuditErrorList = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const { form } = route.params;
  const [errors, setErrors] = useState([]);

  // Colors
  const bgMain = '$backgroundLight100';
  const cardBg = '$white';
  const textColor = '$textDark800';

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
        <Pressable onPress={addError} style={{ paddingHorizontal: 12, opacity: 1 }}>
          <MIcon name="add" size={28} color="#fff" />
        </Pressable>
      ),
    });
  }, [navigation, addError]);

  const renderErrorRow = useCallback(({ item }) => (
    <Pressable onPress={() => editError(item)}>
      {({ pressed }) => (
        <Box
          bg={cardBg}
          mx="$4"
          my="$1.5"
          borderRadius="$2xl"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={2}
          overflow="hidden"
          style={{ transform: [{ scale: pressed ? 0.98 : 1 }] }}
        >
          <HStack alignItems="center" p="$4">
            <Center bg="$red100" w="$12" h="$12" borderRadius="$xl" mr="$3">
              <MIcon name="error-outline" size={20} color="#dc2626" />
            </Center>
            <VStack flex={1}>
              <Text fontSize="$md" fontWeight="$bold" color="$textDark800">
                {item.ElementTypeText}
              </Text>
              <Text fontSize="$sm" color="$textLight500">
                {item.ErrorTypeText}
              </Text>
              <HStack alignItems="center" space="xs" mt="$1">
                <MIcon name="pin" size={12} color="#f97316" />
                <Text fontSize="$xs" color="$orange500" fontWeight="$bold">
                  {item.CountError} fout(en)
                </Text>
              </HStack>
            </VStack>
            <HStack space="sm">
              <Pressable onPress={() => deleteError(item)}>
                {({ pressed: delPressed }) => (
                  <Center
                    bg={delPressed ? '$red100' : '$red50'}
                    w="$10"
                    h="$10"
                    borderRadius="$xl"
                  >
                    <MIcon name="delete" size={16} color="#ef4444" />
                  </Center>
                )}
              </Pressable>
              <Center bg="$backgroundLight100" w="$10" h="$10" borderRadius="$xl">
                <MIcon name="chevron-right" size={16} color="#9ca3af" />
              </Center>
            </HStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  ), [cardBg, editError, deleteError]);

  const renderEmptyState = useCallback(() => (
    <Center flex={1} py="$20">
      <Center bg="$green100" w="$20" h="$20" borderRadius="$full" mb="$4">
        <MIcon name="check-circle" size={48} color="#22c55e" />
      </Center>
      <Text fontSize="$lg" fontWeight="$bold" color="$textDark700" mb="$1">
        Geen fouten gevonden
      </Text>
      <Text fontSize="$sm" color="$textLight500" textAlign="center" px="$8" mb="$4">
        Er zijn nog geen fouten geregistreerd voor dit formulier.
      </Text>
      <Button
        bg="$amber500"
        sx={{ ':active': { bg: '$amber600' } }}
        borderRadius="$xl"
        onPress={addError}
      >
        <MIcon name="add" size={16} color="#fff" />
        <ButtonText color="$white" ml="$1">Fout Toevoegen</ButtonText>
      </Button>
    </Center>
  ), [addError]);

  const renderHeader = useCallback(() => (
    errors.length > 0 ? (
      <HStack px="$4" py="$3" alignItems="center" justifyContent="space-between">
        <Text fontSize="$sm" color="$textLight500">
          Geregistreerde fouten
        </Text>
        <Box bg="$red100" px="$3" py="$1" borderRadius="$full">
          <Text fontSize="$xs" fontWeight="$bold" color="$red600">
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
