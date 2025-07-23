const { Sequelize } = require('sequelize');
const config = require('./database');

// Ortam değişkenine göre uygun yapılandırmayı seç.
// NODE_ENV ayarlı değilse 'development' varsayılır.
const env = process.env.NODE_ENV || 'development';
const envConfig = config[env];

// Yeni Sequelize instance'ı oluştur.
const sequelize = new Sequelize(envConfig);

module.exports = sequelize; 