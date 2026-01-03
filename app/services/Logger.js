/* eslint-disable prettier/prettier */
/**
 * Logger utility - only logs in development mode
 * Usage: import { log, logError, logWarn } from '../services/Logger';
 */

export const log = (...args) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const logError = (...args) => {
  if (__DEV__) {
    console.error(...args);
  }
};

export const logWarn = (...args) => {
  if (__DEV__) {
    console.warn(...args);
  }
};

export const logInfo = (...args) => {
  if (__DEV__) {
    console.info(...args);
  }
};

// For debugging specific features - can be toggled
export const logDebug = (feature, ...args) => {
  if (__DEV__) {
    console.log(`[${feature}]`, ...args);
  }
};

export default {
  log,
  logError,
  logWarn,
  logInfo,
  logDebug,
};
