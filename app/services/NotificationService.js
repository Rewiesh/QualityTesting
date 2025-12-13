/* eslint-disable prettier/prettier */
/**
 * NotificationService - Local notifications for incomplete audits
 */
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import * as database from './database/database1';

// Channel ID for Android
const CHANNEL_ID = 'audit-reminders';

/**
 * Initialize notification channels (required for Android)
 */
const initialize = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Create channel for Android
  PushNotification.createChannel(
    {
      channelId: CHANNEL_ID,
      channelName: 'Audit Herinneringen',
      channelDescription: 'Herinneringen voor incomplete audits',
      playSound: true,
      soundName: 'default',
      importance: 4, // High
      vibrate: true,
    },
    (created) => console.log(`Notification channel created: ${created}`)
  );
};

/**
 * Schedule a reminder for incomplete audits
 */
const scheduleIncompleteAuditReminder = async () => {
  try {
    // Get audits with progress but no signature
    const allAudits = await database.getAllAuditsForStats();
    const incompleteAudits = allAudits.filter(
      a => a.hasProgress === 1 && a.hasSignature !== 1
    );

    if (incompleteAudits.length === 0) {
      // Cancel any existing reminders if no incomplete audits
      PushNotification.cancelAllLocalNotifications();
      return;
    }

    // Schedule notification for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    PushNotification.localNotificationSchedule({
      channelId: CHANNEL_ID,
      title: 'Incomplete Audits',
      message: `Je hebt ${incompleteAudits.length} audit(s) die nog niet zijn voltooid.`,
      date: tomorrow,
      allowWhileIdle: true,
      repeatType: 'day', // Repeat daily
      userInfo: { type: 'incomplete_audit_reminder' },
    });

    console.log(`Scheduled reminder for ${incompleteAudits.length} incomplete audits`);
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Show immediate notification
 */
const showLocalNotification = (title, message, data = {}) => {
  PushNotification.localNotification({
    channelId: CHANNEL_ID,
    title,
    message,
    playSound: true,
    soundName: 'default',
    userInfo: data,
  });
};

/**
 * Show notification for upload success
 */
const showUploadSuccess = (auditCode) => {
  showLocalNotification(
    'Upload Voltooid',
    `Audit ${auditCode} is succesvol geüpload.`,
    { type: 'upload_success', auditCode }
  );
};

/**
 * Show notification for upload failure
 */
const showUploadFailure = (auditCode, reason) => {
  showLocalNotification(
    'Upload Mislukt',
    `Audit ${auditCode} kon niet worden geüpload. ${reason || ''}`,
    { type: 'upload_failure', auditCode }
  );
};

/**
 * Cancel all scheduled notifications
 */
const cancelAll = () => {
  PushNotification.cancelAllLocalNotifications();
};

/**
 * Get scheduled notifications count
 */
const getScheduledCount = () => {
  return new Promise((resolve) => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      resolve(notifications.length);
    });
  });
};

export const NotificationService = {
  initialize,
  scheduleIncompleteAuditReminder,
  showLocalNotification,
  showUploadSuccess,
  showUploadFailure,
  cancelAll,
  getScheduledCount,
};

export default NotificationService;
