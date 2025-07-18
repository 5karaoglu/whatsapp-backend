const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'whatsapp_management.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize; 