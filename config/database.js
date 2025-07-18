const { Sequelize } = require('sequelize');
const path = require('path');

// Use /tmp directory for the database in Vercel's environment
const storagePath = process.env.VERCEL_ENV === 'production' 
  ? '/tmp/whatsapp_management.sqlite' 
  : path.join(__dirname, '..', 'whatsapp_management.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize; 