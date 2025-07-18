const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encrypt, decrypt } = require('../services/encryption.service');
const User = require('./user.model');

const UserCredentials = sequelize.define('UserCredentials', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  whatsapp_token: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return decrypt(this.getDataValue('whatsapp_token'));
    },
    set(value) {
      this.setDataValue('whatsapp_token', encrypt(value));
    },
  },
  phone_number_id: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return decrypt(this.getDataValue('phone_number_id'));
    },
    set(value) {
      this.setDataValue('phone_number_id', encrypt(value));
    },
  },
  whatsapp_business_account_id: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      return decrypt(this.getDataValue('whatsapp_business_account_id'));
    },
    set(value) {
      this.setDataValue('whatsapp_business_account_id', encrypt(value));
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false,
    unique: true
  }
});

User.hasOne(UserCredentials, { foreignKey: 'userId' });
UserCredentials.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserCredentials; 