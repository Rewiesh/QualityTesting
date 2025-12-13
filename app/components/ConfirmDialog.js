/* eslint-disable prettier/prettier */
/**
 * ConfirmDialog - Reusable confirmation dialog for destructive actions
 */
import React from 'react';
import { AlertDialog, Button, Text, HStack, Center, Icon, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Preset configurations for common actions
const PRESETS = {
  delete: {
    icon: 'delete',
    iconColor: 'red',
    title: 'Verwijderen',
    message: 'Weet je zeker dat je dit wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
    confirmText: 'Verwijderen',
    confirmColor: 'red',
  },
  discard: {
    icon: 'cancel',
    iconColor: 'orange',
    title: 'Wijzigingen negeren',
    message: 'Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt afsluiten?',
    confirmText: 'Negeren',
    confirmColor: 'orange',
  },
  logout: {
    icon: 'logout',
    iconColor: 'blue',
    title: 'Uitloggen',
    message: 'Weet je zeker dat je wilt uitloggen?',
    confirmText: 'Uitloggen',
    confirmColor: 'blue',
  },
  reset: {
    icon: 'refresh',
    iconColor: 'orange',
    title: 'Resetten',
    message: 'Weet je zeker dat je alles wilt resetten? Dit kan niet ongedaan worden gemaakt.',
    confirmText: 'Resetten',
    confirmColor: 'orange',
  },
  upload: {
    icon: 'cloud-upload',
    iconColor: 'green',
    title: 'Uploaden',
    message: 'Weet je zeker dat je deze audit wilt uploaden?',
    confirmText: 'Uploaden',
    confirmColor: 'green',
  },
  clearSignature: {
    icon: 'gesture',
    iconColor: 'orange',
    title: 'Handtekening wissen',
    message: 'Weet je zeker dat je de handtekening wilt wissen?',
    confirmText: 'Wissen',
    confirmColor: 'orange',
  },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  preset,
  // Custom props (override preset)
  icon,
  iconColor,
  title,
  message,
  confirmText,
  cancelText = 'Annuleren',
  confirmColor,
  isLoading = false,
}) => {
  const cancelRef = React.useRef(null);

  // Get preset config or use custom props
  const config = preset ? PRESETS[preset] : {};
  const finalIcon = icon || config.icon || 'help';
  const finalIconColor = iconColor || config.iconColor || 'blue';
  const finalTitle = title || config.title || 'Bevestigen';
  const finalMessage = message || config.message || 'Weet je zeker dat je wilt doorgaan?';
  const finalConfirmText = confirmText || config.confirmText || 'Bevestigen';
  const finalConfirmColor = confirmColor || config.confirmColor || 'blue';

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialog.Content rounded="2xl">
        <AlertDialog.CloseButton />
        <AlertDialog.Header borderBottomWidth={0}>
          <HStack alignItems="center" space={2}>
            <Center bg={`${finalIconColor}.100`} size="10" rounded="lg">
              <Icon 
                as={MaterialIcons} 
                name={finalIcon} 
                size="md" 
                color={`${finalIconColor}.600`} 
              />
            </Center>
            <Text fontSize="lg" fontWeight="bold">{finalTitle}</Text>
          </HStack>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Text color="gray.600">{finalMessage}</Text>
        </AlertDialog.Body>
        <AlertDialog.Footer borderTopWidth={0}>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              onPress={onClose}
              ref={cancelRef}
              rounded="xl"
              _text={{ color: 'gray.600' }}
              isDisabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              bg={`${finalConfirmColor}.500`}
              _pressed={{ bg: `${finalConfirmColor}.600` }}
              onPress={onConfirm}
              rounded="xl"
              isLoading={isLoading}
              leftIcon={
                !isLoading && (
                  <Icon as={MaterialIcons} name={finalIcon} size="sm" color="white" />
                )
              }
            >
              {finalConfirmText}
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState({});
  const resolveRef = React.useRef(null);

  const confirm = React.useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setConfig(options);
      setIsOpen(true);
    });
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
  }, []);

  const handleConfirm = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
  }, []);

  const DialogComponent = React.useCallback(() => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...config}
    />
  ), [isOpen, config, handleClose, handleConfirm]);

  return { confirm, DialogComponent };
};

export default ConfirmDialog;
