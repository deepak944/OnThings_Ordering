require('dotenv').config();

const mysql = require('mysql2/promise');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForDatabase = async () => {
  const maxAttempts = Number(process.env.DB_WAIT_MAX_ATTEMPTS || 30);
  const delayMs = Number(process.env.DB_WAIT_DELAY_MS || 2000);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
      });

      await connection.query('SELECT 1');
      await connection.end();
      console.log(`Database is ready after ${attempt} attempt(s).`);
      return;
    } catch (error) {
      console.log(
        `Waiting for database (${attempt}/${maxAttempts}): ${error.code || error.message || 'unknown error'}`
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await sleep(delayMs);
    }
  }
};

waitForDatabase().catch((error) => {
  console.error(`Database wait failed: ${error.message || error}`);
  process.exit(1);
});
