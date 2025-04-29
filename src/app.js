const express = require('express');
const { PORT } = require('./config');
// const v1Routes = require('./v1/routes');
const { errorHandler } = require('./middlewares');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API versioning
// app.use('/api/v1', v1Routes);

// Global error handler
app.use(errorHandler);

module.exports = app;
