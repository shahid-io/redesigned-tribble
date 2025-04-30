declare namespace Express {
  export interface Request {
    geoData?: {
      country: string;
      countryCode: string;
      city: string;
      ip: string;
    };
  }
}
