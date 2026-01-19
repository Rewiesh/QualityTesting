/* eslint-disable prettier/prettier */
/**
 * FotoPreview - Thumbnail preview component for error photos
 */
import React, { useState } from 'react';
import { Image, TouchableOpacity, Modal as RNModal, Dimensions } from 'react-native';
import { Box, Center, Text, HStack, Pressable, VStack } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Thumbnail component
// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

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
        {({ pressed }) => (
          <Center
            bg={pressed ? '$backgroundLight300' : '$backgroundLight200'}
            w={size}
            h={size}
            borderRadius="$lg"
            borderWidth={2}
            borderColor="$borderLight200"
            borderStyle="dashed"
            style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}
          >
            <MIcon name={placeholder} size={20} color="#9ca3af" />
          </Center>
        )}
      </Pressable>
    );
  }

  return (
    <Box position="relative">
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <Box
            w={size}
            h={size}
            borderRadius="$lg"
            overflow="hidden"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={3}
            style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}
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
          <Center bg="$red500" w="$5" h="$5" borderRadius="$full" shadowColor="$black" shadowOffset={{ width: 0, height: 1 }} shadowOpacity={0.2} shadowRadius={2}>
            <MIcon name="close" size={10} color="#fff" />
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
          px="$4" 
          py="$4"
          pt="$12"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text color="$white" fontSize="$lg" fontWeight="$bold">{title}</Text>
          <Pressable onPress={onClose} p="$2">
            <MIcon name="close" size={24} color="#fff" />
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
