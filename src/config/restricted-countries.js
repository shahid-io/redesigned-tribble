/**
 * Country Restriction Module
 * @module RestrictedCountries
 * @description Manages geographic access restrictions
 * 
 * @requires Logger - Application logging utility
 */
const Logger = require('./logger-config');

/**
 * @typedef {Object.<string, string>} CountryMap
 * @description Map of country codes to country names
 * @readonly
 */
const RESTRICTED_COUNTRIES = {
  'SY': 'Syria',
  'AF': 'Afghanistan', 
  'IR': 'Iran',
  'KP': 'North Korea',
  'CU': 'Cuba'
};

/**
 * Check if a country is in the restricted list
 * 
 * @function isCountryRestricted
 * @description Validates country codes against restricted list
 * 
 * Features:
 * - Case-insensitive matching
 * - Null safety checks
 * - Detailed logging
 * - Error handling
 * 
 * @param {string} countryCode - ISO 2-letter country code
 * @returns {boolean} true if country is restricted
 */
const isCountryRestricted = (countryCode) => {
  try {
    if (!countryCode) {
      Logger.warn('Country code is missing or undefined');
      return false;
    }

    const normalizedCode = countryCode.toUpperCase();
    const isRestricted = Object.keys(RESTRICTED_COUNTRIES).includes(normalizedCode);
    
    Logger.info(`Country restriction check: ${normalizedCode} (${RESTRICTED_COUNTRIES[normalizedCode] || 'Unknown'}) - Restricted: ${isRestricted}`);
    
    return isRestricted;
  } catch (error) {
    Logger.error('Error checking country restriction:', error);
    return false;
  }
};

/**
 * Initialize logging of restricted countries
 * @description Logs all restricted countries on startup for monitoring
 */
Logger.info('Initialized restricted countries:', Object.entries(RESTRICTED_COUNTRIES)
  .map(([code, name]) => `${code}: ${name}`)
  .join(', ')
);

// Export constants and utilities
module.exports = {
  RESTRICTED_COUNTRIES,
  isCountryRestricted
};