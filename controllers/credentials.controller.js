const UserCredentials = require('../models/credentials.model');

// Get the credentials for the logged-in user
exports.getCredentials = async (req, res) => {
  try {
    const credentials = await UserCredentials.findOne({ where: { userId: req.user.id } });
    if (!credentials) {
      return res.status(404).json({ success: false, message: 'Credentials not found for this user.' });
    }
    // Map database fields to the fields expected by the frontend
    res.json({
      success: true,
      data: {
        phoneNumberId: credentials.phone_number_id,
        accessToken: credentials.whatsapp_token,
        whatsappBusinessAccountId: credentials.whatsapp_business_account_id,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve credentials.', error: error.message });
  }
};

// Update the credentials for the logged-in user
exports.updateCredentials = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, whatsappBusinessAccountId } = req.body;
    
    const [credentials, created] = await UserCredentials.findOrCreate({
      where: { userId: req.user.id }
    });
    
    // Update fields only if they are provided in the request body
    if (accessToken) {
      credentials.whatsapp_token = accessToken;
    }
    if (phoneNumberId) {
      credentials.phone_number_id = phoneNumberId;
    }
    if (whatsappBusinessAccountId) {
      credentials.whatsapp_business_account_id = whatsappBusinessAccountId;
    }
    
    await credentials.save();

    res.json({ success: true, message: 'Credentials updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update credentials.', error: error.message });
  }
}; 