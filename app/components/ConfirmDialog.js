/* eslint-disable prettier/prettier */
/**
 * ConfirmDialog - Reusable confirmation dialog for destructive actions
 */
import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  ButtonText,
  ButtonSpinner,
  Text,
  HStack,
  Center,
  Icon,
  CloseIcon,
} from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Icon wrapper for MaterialIcons
const MIcon = ({ name, size = 16, color = "#000" }) => (
  <MaterialIcons name={name} size={size} color={color} />
);

// Color mapping
const colorMap = {
  red: { bg: '$red100', icon: '#dc2626', btn: '$red500', btnPressed: '$red600' },
  orange: { bg: '$orange100', icon: '#ea580c', btn: '$orange500', btnPressed: '$orange600' },
  blue: { bg: '$blue100', icon: '#2563eb', btn: '$blue500', btnPressed: '$blue600' },
  green: { bg: '$green100', icon: '#16a34a', btn: '$green500', btnPressed: '$green600' },
};

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
  // Get preset config or use custom props
  const config = preset ? PRESETS[preset] : {};
  const finalIcon = icon || config.icon || 'help';
  const finalIconColor = iconColor || config.iconColor || 'blue';
  const finalTitle = title || config.title || 'Bevestigen';
  const finalMessage = message || config.message || 'Weet je zeker dat je wilt doorgaan?';
  const finalConfirmText = confirmText || config.confirmText || 'Bevestigen';
  const finalConfirmColor = confirmColor || config.confirmColor || 'blue';

  const colors = colorMap[finalConfirmColor] || colorMap.blue;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent borderRadius="$2xl">
        <AlertDialogCloseButton>
          <Icon as={CloseIcon} />
        </AlertDialogCloseButton>
        <AlertDialogHeader borderBottomWidth={0}>
          <HStack alignItems="center" space="sm">
            <Center bg={colors.bg} w="$10" h="$10" borderRadius="$lg">
              <MIcon name={finalIcon} size={20} color={colors.icon} />
            </Center>
            <Text fontSize="$lg" fontWeight="$bold">{finalTitle}</Text>
          </HStack>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text color="$textLight600">{finalMessage}</Text>
        </AlertDialogBody>
        <AlertDialogFooter borderTopWidth={0} gap="$2">
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            borderRadius="$xl"
            isDisabled={isLoading}
          >
            <ButtonText color="$textLight600">{cancelText}</ButtonText>
          </Button>
          <Button
            bg={colors.btn}
            onPress={onConfirm}
            borderRadius="$xl"
            isDisabled={isLoading}
            sx={{ ":active": { bg: colors.btnPressed } }}
          >
            {isLoading ? (
              <ButtonSpinner color="$white" />
            ) : (
              <>
                <MIcon name={finalIcon} size={16} color="#fff" />
                <ButtonText color="$white" ml="$1">{finalConfirmText}</ButtonText>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
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
