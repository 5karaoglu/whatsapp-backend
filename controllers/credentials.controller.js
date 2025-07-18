const UserCredentials = require('../models/credentials.model');

// Get the credentials for the logged-in user
exports.getCredentials = async (req, res) => {
  try {
    const credentials = await UserCredentials.findOne({ where: { userId: req.user.id } });
    if (!credentials) {
      return res.status(404).json({ success: false, message: 'Credentials not found for this user.' });
    }
    res.json({ success: true, data: credentials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve credentials.', error: error.message });
  }
};

// Update the credentials for the logged-in user
exports.updateCredentials = async (req, res) => {
  try {
    const { whatsapp_token, phone_number_id, whatsapp_business_account_id } = req.body;
    
    const [credentials, created] = await UserCredentials.findOrCreate({
      where: { userId: req.user.id }
    });
    
    credentials.whatsapp_token = whatsapp_token || null;
    credentials.phone_number_id = phone_number_id || null;
    credentials.whatsapp_business_account_id = whatsapp_business_account_id || null;
    
    await credentials.save();

    res.json({ success: true, message: 'Credentials updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update credentials.', error: error.message });
  }
}; 