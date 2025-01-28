const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  dialect: 'postgres',

  production: {
    client: 'pg',
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: __dirname + '/db/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds'
    }
  },

  development: {
    client: 'pg',
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: __dirname + '/db/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: __dirname + '/db/seeds'
    }
  }
};
