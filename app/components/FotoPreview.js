/* eslint-disable prettier/prettier */
/**
 * FotoPreview - Thumbnail preview component for error photos
 */
import React, { useState } from 'react';
import { Image, TouchableOpacity, Modal as RNModal, Dimensions } from 'react-native';
import { Box, Center, Icon, Text, HStack, Pressable, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Thumbnail component
export const FotoThumbnail = ({ 
  source, 
  size = 60, 
  onPress, 
  onDelete,
  showDeleteButton = true,
  placeholder = 'photo-camera',
}) => {
  const hasImage = source && (source.uri || typeof source === 'number');

  if (!hasImage) {
    return (
      <Pressable onPress={onPress}>
        {({ isPressed }) => (
          <Center
            bg={isPressed ? 'gray.200' : 'gray.100'}
            size={size}
            rounded="lg"
            borderWidth={2}
            borderColor="gray.200"
            borderStyle="dashed"
            style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
          >
            <Icon as={MaterialIcons} name={placeholder} size="md" color="gray.400" />
          </Center>
        )}
      </Pressable>
    );
  }

  return (
    <Box position="relative">
      <Pressable onPress={onPress}>
        {({ isPressed }) => (
          <Box
            size={size}
            rounded="lg"
            overflow="hidden"
            shadow={2}
            style={{ transform: [{ scale: isPressed ? 0.95 : 1 }] }}
          >
            <Image
              source={source}
              style={{ width: size, height: size }}
              resizeMode="cover"
            />
          </Box>
        )}
      </Pressable>
      {showDeleteButton && onDelete && (
        <Pressable
          position="absolute"
          top={-6}
          right={-6}
          onPress={onDelete}
        >
          <Center bg="red.500" size="5" rounded="full" shadow={2}>
            <Icon as={MaterialIcons} name="close" size="2xs" color="white" />
          </Center>
        </Pressable>
      )}
    </Box>
  );
};

// Full screen preview modal
export const FotoPreviewModal = ({ 
  isOpen, 
  onClose, 
  source,
  title = 'Foto Preview',
}) => {
  if (!isOpen || !source) return null;

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Box flex={1} bg="rgba(0,0,0,0.9)" justifyContent="center" alignItems="center">
        {/* Header */}
        <HStack 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          px="4" 
          py="4"
          safeAreaTop
          justifyContent="space-between"
          alignItems="center"
        >
          <Text color="white" fontSize="lg" fontWeight="bold">{title}</Text>
          <Pressable onPress={onClose} p="2">
            <Icon as={MaterialIcons} name="close" size="lg" color="white" />
          </Pressable>
        </HStack>

        {/* Image */}
        <Image
          source={source}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT * 0.7,
          }}
          resizeMode="contain"
        />
      </Box>
    </RNModal>
  );
};

// Combined component with thumbnail and preview
const FotoPreview = ({ 
  source, 
  size = 60, 
  onDelete,
  onAddPhoto,
  showDeleteButton = true,
  title = 'Foto Preview',
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const handlePress = () => {
    if (source) {
      setPreviewVisible(true);
    } else if (onAddPhoto) {
      onAddPhoto();
    }
  };

  return (
    <>
      <FotoThumbnail
        source={source}
        size={size}
        onPress={handlePress}
        onDelete={onDelete}
        showDeleteButton={showDeleteButton}
      />
      <FotoPreviewModal
        isOpen={previewVisible}
        onClose={() => setPreviewVisible(false)}
        source={source}
        title={title}
      />
    </>
  );
};

export default FotoPreview;
