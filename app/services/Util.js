import { Alert } from 'react-native';

/**
 * ShowToast - Simple toast-like notification
 * Uses console.log as fallback since gluestack-ui toast requires hook context
 * For actual toast UI, use the ToastService in component context
 */
export const ShowToast = ({status, message, bgColor, textColor}) => {
  // Log the toast message
  const icon = status === 'success' ? '✓' : '✗';
  console.log(`[${icon}] ${message}`);
  
  // Note: For actual toast UI in components, import and use:
  // import { useToast, Toast, ToastTitle } from '@gluestack-ui/themed';
};

