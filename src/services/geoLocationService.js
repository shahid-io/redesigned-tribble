const axios = require('axios');
const { Logger } = require('../config');

class GeoLocationService {
    constructor() {
        this.API_URL = 'http://ip-api.com/json';
    }

    async getUserLocation(ip) {
        try {
            const response = await axios.get(`${this.API_URL}/${ip}`);
            return {
                country: response.data.country,
                countryCode: response.data.countryCode,
                city: response.data.city,
                ip: response.data.query
            };
        } catch (error) {
            Logger.error('Geolocation service error:', error);
            throw new Error('Failed to fetch geolocation data');
        }
    }
}

const geoLocationService = new GeoLocationService();

module.exports = {
    geoLocationService
};
