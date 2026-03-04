const { Sequelize } = require('sequelize');

const requiredEnv = ['DB_HOST', 'DB_NAME', 'DB_USER'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

if (process.env.DB_PASSWORD === 'your_mysql_password') {
  throw new Error('DB_PASSWORD is still placeholder text. Update it in backend/onthings-backend/.env');
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
