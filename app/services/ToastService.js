/* eslint-disable prettier/prettier */
/**
 * ToastService - Centralized toast notification service
 * Provides consistent, user-friendly messages throughout the app
 */
import { Toast } from 'native-base';

// Toast types with corresponding colors and icons
const TOAST_CONFIG = {
  success: {
    bg: 'green.500',
    icon: 'check-circle',
    defaultTitle: 'Gelukt!',
  },
  error: {
    bg: 'red.500',
    icon: 'error',
    defaultTitle: 'Fout',
  },
  warning: {
    bg: 'orange.500',
    icon: 'warning',
    defaultTitle: 'Let op',
  },
  info: {
    bg: 'blue.500',
    icon: 'info',
    defaultTitle: 'Info',
  },
};

// Predefined messages for common actions
const MESSAGES = {
  // Network
  offline: {
    type: 'warning',
    title: 'Geen internetverbinding',
    message: 'Je bent offline. Sommige functies zijn niet beschikbaar.',
  },
  online: {
    type: 'success',
    title: 'Verbonden',
    message: 'Je bent weer online.',
  },
  networkError: {
    type: 'error',
    title: 'Netwerkfout',
    message: 'Controleer je internetverbinding en probeer opnieuw.',
  },

  // Auth
  loginSuccess: {
    type: 'success',
    title: 'Welkom terug!',
    message: 'Je bent succesvol ingelogd.',
  },
  loginFailed: {
    type: 'error',
    title: 'Inloggen mislukt',
    message: 'Controleer je gebruikersnaam en wachtwoord.',
  },
  sessionExpired: {
    type: 'warning',
    title: 'Sessie verlopen',
    message: 'Log opnieuw in om door te gaan.',
  },

  // Data operations
  saveSuccess: {
    type: 'success',
    title: 'Opgeslagen',
    message: 'Je wijzigingen zijn opgeslagen.',
  },
  saveFailed: {
    type: 'error',
    title: 'Opslaan mislukt',
    message: 'Er ging iets mis bij het opslaan. Probeer opnieuw.',
  },
  deleteSuccess: {
    type: 'success',
    title: 'Verwijderd',
    message: 'Item succesvol verwijderd.',
  },
  deleteFailed: {
    type: 'error',
    title: 'Verwijderen mislukt',
    message: 'Kon item niet verwijderen. Probeer opnieuw.',
  },

  // Upload
  uploadSuccess: {
    type: 'success',
    title: 'Upload voltooid',
    message: 'Audit succesvol geüpload.',
  },
  uploadFailed: {
    type: 'error',
    title: 'Upload mislukt',
    message: 'Kon audit niet uploaden. Probeer later opnieuw.',
  },
  uploadPending: {
    type: 'info',
    title: 'Upload in wachtrij',
    message: 'Audit wordt geüpload zodra je online bent.',
  },

  // Sync
  syncSuccess: {
    type: 'success',
    title: 'Gesynchroniseerd',
    message: 'Gegevens zijn bijgewerkt.',
  },
  syncFailed: {
    type: 'error',
    title: 'Synchronisatie mislukt',
    message: 'Kon gegevens niet synchroniseren.',
  },

  // Audit specific
  auditStarted: {
    type: 'info',
    title: 'Audit gestart',
    message: 'Je kunt nu fouten registreren.',
  },
  auditCompleted: {
    type: 'success',
    title: 'Audit voltooid',
    message: 'Vergeet niet om te uploaden!',
  },
  formSaved: {
    type: 'success',
    title: 'Formulier opgeslagen',
    message: 'Wijzigingen zijn opgeslagen.',
  },
  signatureSaved: {
    type: 'success',
    title: 'Handtekening opgeslagen',
    message: 'Handtekening succesvol opgeslagen.',
  },

  // Validation
  requiredFields: {
    type: 'warning',
    title: 'Velden ontbreken',
    message: 'Vul alle verplichte velden in.',
  },
  invalidInput: {
    type: 'error',
    title: 'Ongeldige invoer',
    message: 'Controleer je invoer en probeer opnieuw.',
  },
};

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {string} options.title - Toast title
 * @param {string} options.message - Toast message
 * @param {number} options.duration - Duration in ms (default: 3000)
 * @param {string} options.placement - Placement: 'top', 'bottom' (default: 'top')
 */
const show = ({
  type = 'info',
  title,
  message,
  duration = 3000,
  placement = 'top',
}) => {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  Toast.show({
    title: title || config.defaultTitle,
    description: message,
    duration,
    placement,
    bg: config.bg,
    _title: { color: 'white', fontWeight: 'bold' },
    _description: { color: 'white' },
  });
};

/**
 * Show a predefined toast message
 * @param {string} messageKey - Key from MESSAGES object
 * @param {Object} overrides - Optional overrides for the message
 */
const showMessage = (messageKey, overrides = {}) => {
  const predefined = MESSAGES[messageKey];
  if (!predefined) {
    console.warn(`ToastService: Unknown message key "${messageKey}"`);
    return;
  }

  show({
    type: predefined.type,
    title: overrides.title || predefined.title,
    message: overrides.message || predefined.message,
    duration: overrides.duration,
    placement: overrides.placement,
  });
};

// Convenience methods
const success = (message, title) => show({ type: 'success', title, message });
const error = (message, title) => show({ type: 'error', title, message });
const warning = (message, title) => show({ type: 'warning', title, message });
const info = (message, title) => show({ type: 'info', title, message });

// Close all toasts
const closeAll = () => Toast.closeAll();

export const ToastService = {
  show,
  showMessage,
  success,
  error,
  warning,
  info,
  closeAll,
  MESSAGES,
};

export default ToastService;
