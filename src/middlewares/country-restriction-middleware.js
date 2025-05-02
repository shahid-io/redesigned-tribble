const axios = require('axios');
const Logger = require('../config/logger-config');
const { isCountryRestricted } = require('../config/restricted-countries');
const { StatusCodes } = require('../types/response');

/**
 * IP Geolocation and Country Restriction Middleware
 */

/**
 * Fetch geolocation data for an IP address
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Geolocation data
 * @throws {Error} When geolocation service fails
 */
const getGeoLocation = async (ip) => {
  try {
    Logger.debug(`Fetching geolocation for IP: ${ip}`);
    const response = await axios.get(`http://ip-api.com/json`, {
      timeout: 5000,
      params: {
        fields: 'status,message,country,countryCode,city,query'
      }
    });

    Logger.debug(`Geolocation response: ${JSON.stringify(response.data)}`);

    if (!response.data || response.data.status === 'fail') {
      throw new Error(`Invalid geolocation response: ${JSON.stringify(response.data)}`);
    }

    return {
      country: response.data.country || 'Unknown',
      countryCode: response.data.countryCode || 'XX',
      city: response.data.city || 'Unknown',
      ip: response.data.query || ip
    };
  } catch (error) {
    Logger.error('Geolocation service error:', error.message);
    throw new Error('Failed to fetch location data');
  }
};

/**
 * Middleware to restrict access based on country
 * Fetches user's geolocation and checks against restricted countries list
 * 
 * @middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const countryRestrictionMiddleware = async (req, res, next) => {
  try {
    const ip = req.headers['x-real-ip'] || 
               req.headers['x-forwarded-for']?.split(',')[0] || 
               req.ip?.replace('::ffff:', '') || 
               '127.0.0.1';
    
    Logger.info(`Processing request from IP: ${ip}`);
    const geoData = await getGeoLocation(ip);
    
    if (isCountryRestricted(geoData.countryCode)) {
      Logger.warn(`Access blocked from restricted country: ${geoData.country} (${geoData.countryCode})`);
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          message: `Access denied: Service not available in ${geoData.country}`,
          code: 'RESTRICTED_LOCATION'
        }
      });
    }
    
    req.geoData = geoData;
    Logger.info(`Request allowed from ${geoData.country} (${geoData.countryCode})`);
    next();
  } catch (error) {
    Logger.error('Country restriction check failed:', error.message);
    return res.status(StatusCodes.INTERNAL_SERVER).json({
      success: false,
      error: {
        message: 'Unable to verify your location. Please try again later.',
        code: 'LOCATION_SERVICE_ERROR'
      }
    });
  }
};

module.exports = countryRestrictionMiddleware;