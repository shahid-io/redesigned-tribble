const Logger = require('./logger-config');

const RESTRICTED_COUNTRIES = {
  'SY': 'Syria',
  'AF': 'Afghanistan', 
  'IR': 'Iran',
  'KP': 'North Korea',
  'CU': 'Cuba'
};

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
Logger.info('Initialized restricted countries:', Object.entries(RESTRICTED_COUNTRIES)
  .map(([code, name]) => `${code}: ${name}`)
  .join(', ')
);

module.exports = {
  RESTRICTED_COUNTRIES,
  isCountryRestricted
};