const { ServerConfig } = require('./index');

const config = {
  development: {
    username: process.env.DEV_DB_USERNAME || 'postgres',
    password: process.env.DEV_DB_PASSWORD || 'root',
    database: process.env.DEV_DB_DATABASE || 'redesigned-tribble',
    host: process.env.DEV_DB_HOST || 'localhost',
    port: process.env.DEV_DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
