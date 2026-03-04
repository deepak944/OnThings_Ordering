require('dotenv').config();
const mysql = require('mysql2/promise');
const { sequelize } = require('../models');

const initDatabase = async () => {
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error('DB_NAME is missing in .env');
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || ''
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.end();

  await sequelize.authenticate();
  // Only sync tables without altering existing ones to prevent data loss
  await sequelize.sync({ force: false });

  console.log(`Database "${dbName}" is ready and all tables are synced.`);
};

initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
