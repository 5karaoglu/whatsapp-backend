require('dotenv').config();
const path = require('path');

// sequelize-cli'nin anlayacağı formatta bir yapılandırma objesi.
// Bu obje, development, test ve production ortamları için ayrı ayrı 
// veritabanı ayarları içerebilir.
const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'whatsapp_management.sqlite'),
    logging: false, // SQL sorgularını görmek için console.log yapabilirsiniz.
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: process.env.DATABASE_STORAGE_PATH || path.join(__dirname, '..', 'whatsapp_management.sqlite'),
    logging: false,
  }
};

module.exports = config; 