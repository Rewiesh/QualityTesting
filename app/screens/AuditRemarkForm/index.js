/* eslint-disable prettier/prettier */
import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Box,
  ScrollView,
  Button,
  Icon,
  Text,
  TextArea,
  VStack,
  HStack,
  Pressable,
  useColorModeValue,
  Image,
} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as database from '../../services/database/database1';
import ImagePickerModal from '../AuditErrorForm/components/ImagePickerModal';

const AuditRemarkForm = ({ navigation, route }) => {
  const [remark, setRemark] = useState(route.params?.remark || {});
  const [modalVisible, setModalVisible] = useState(false);

  const bgMain = useColorModeValue('coolGray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const onRemarkTextChange = useCallback((value) => {
    setRemark(prev => ({ ...prev, RemarkText: value }));
  }, []);

  const openImagePicker = useCallback(() => {
    setModalVisible(true);
  }, []);

  const onSaveImage = useCallback((uri) => {
    setRemark(prev => ({ ...prev, RemarkImg: uri }));
  }, []);

  const deleteImage = useCallback(() => {
    setRemark(prev => ({ ...prev, RemarkImg: '' }));
    setModalVisible(false);
  }, []);

  const saveRemark = useCallback(async () => {
    if (!remark.RemarkText?.trim() && !remark.RemarkImg) {
      Alert.alert('Fout', 'Voeg minimaal een opmerking of foto toe');
      return;
    }

    try {
      await database.saveFormRemark(remark, route.params.form.FormId);
      await database.setAuditUnsaved(route.params.AuditId, true);
      navigation.goBack();
    } catch (ex) {
      console.error('Error during save:', ex);
      Alert.alert('Fout', ex.message);
    }
  }, [remark, route.params.form.FormId, route.params.AuditId, navigation]);

  return (
    <Box flex={1} bg={bgMain}>
      <ScrollView flex={1} _contentContainerStyle={{ p: '4', pb: '4' }}>
        <Box bg="blue.50" p="3" rounded="xl" mb="4">
          <Text fontSize="sm" color="blue.700" textAlign="center">
            Voeg een algemene opmerking toe zonder foutregistratie
          </Text>
        </Box>

        <VStack bg={cardBg} p="4" rounded="2xl" shadow={1} mb="4" space={2}>
          <HStack alignItems="center" space={2} mb="2">
            <Icon as={MaterialIcons} name="edit-note" size="md" color="purple.500" />
            <Text fontSize="md" fontWeight="bold" color="coolGray.800">
              Opmerking
            </Text>
          </HStack>
          <TextArea
            placeholder="Plaats hier uw opmerking..."
            value={remark.RemarkText || ''}
            onChangeText={onRemarkTextChange}
            autoCompleteType="off"
            h={32}
            fontSize="md"
          />
        </VStack>

        <VStack bg={cardBg} p="4" rounded="2xl" shadow={1} space={3}>
          <HStack alignItems="center" space={2}>
            <Icon as={MaterialIcons} name="photo-camera" size="md" color="teal.500" />
            <Text fontSize="md" fontWeight="bold" color="coolGray.800">
              Foto
            </Text>
          </HStack>
          
          {remark.RemarkImg ? (
            <Box>
              <Pressable onPress={openImagePicker}>
                <Box rounded="xl" overflow="hidden" borderWidth={1} borderColor="gray.200">
                  <Image
                    source={{ uri: remark.RemarkImg }}
                    alt="Opmerking foto"
                    h="64"
                    w="100%"
                    resizeMode="cover"
                  />
                </Box>
              </Pressable>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onPress={deleteImage}
                leftIcon={<Icon as={MaterialIcons} name="delete" size="sm" />}
                mt="2"
              >
                Verwijder foto
              </Button>
            </Box>
          ) : (
            <Pressable
              onPress={openImagePicker}
              bg="gray.50"
              p="6"
              rounded="xl"
              borderWidth={2}
              borderColor="gray.200"
              borderStyle="dashed"
            >
              <VStack alignItems="center" space={2}>
                <Icon as={MaterialIcons} name="add-a-photo" size="2xl" color="blue.400" />
                <Text fontSize="sm" color="gray.600">
                  Tik om foto toe te voegen
                </Text>
              </VStack>
            </Pressable>
          )}
        </VStack>
      </ScrollView>

      <ImagePickerModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Opmerking Afbeelding"
        currentImage={remark.RemarkImg}
        onSaveImage={onSaveImage}
        onDeleteImage={deleteImage}
        onSaveError={() => {}}
        iconColor="teal"
      />

      <Box px="4" py="3" pb="6" bg={bgMain} shadow={3}>
        <Button
          size="lg"
          bg="fdis.500"
          _pressed={{ bg: 'fdis.600' }}
          _text={{ color: 'white', fontWeight: 'bold' }}
          rounded="xl"
          leftIcon={<Icon as={MaterialIcons} name="save" size="md" color="white" />}
          onPress={saveRemark}
        >
          Opmerking opslaan
        </Button>
      </Box>
    </Box>
  );
};

export default AuditRemarkForm;
