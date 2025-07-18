const CryptoJS = require('crypto-js');
require('dotenv').config();

const secretKey = process.env.ENCRYPTION_SECRET;

if (!secretKey) {
  throw new Error('ENCRYPTION_SECRET is not defined in the .env file.');
}

const encrypt = (text) => {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

const decrypt = (ciphertext) => {
  if (!ciphertext) return null;
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt }; 