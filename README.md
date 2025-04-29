# Redesigned Tribble

A Node.js backend application with Express and PostgreSQL.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Winston Logger
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone https://github.com/shahid-io/redesigned-tribble.git
cd redesigned-tribble
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Copy `.sample.env` to `.env`
   - Update the values according to your setup

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=24h

# Database Configuration
DB_DIALECT=postgres
DB_LOGGING=true
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_SSL_REJECT_UNAUTHORIZED=false

# Development Database
DEV_DB_DIALECT=postgres
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_USERNAME=postgres
DEV_DB_PASSWORD=root
DEV_DB_DATABASE=redesigned-tribble

# Production Database
PROD_DB_DIALECT=postgres
PROD_DB_HOST=prod_host
PROD_DB_PORT=5432
PROD_DB_USERNAME=postgres
PROD_DB_PASSWORD=root
PROD_DB_DATABASE=redesigned-tribble
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with nodemon
- `npm run db:migrate`: Run database migrations
- `npm run db:seed`: Run database seeders

## Project Structure

```
src/
├── config/         # Configuration files
├── common/         # Common utilities
├── middlewares/    # Express middlewares
├── models/         # Sequelize models
├── routes/         # API routes
├── controllers/    # Route controllers
├── services/       # Business logic
└── utils/          # Utility functions
```

## Features

- Environment-based configuration
- Centralized error handling
- Winston logging system
- Database connection pooling
- API versioning
- JWT authentication support
- Structured project layout

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
