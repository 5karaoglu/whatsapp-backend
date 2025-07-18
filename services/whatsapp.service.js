const axios = require('axios');

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v19.0';

/**
 * A helper function to get user's credentials and throw an error if they are missing.
 */
const getCheckedCredentials = (credentials, required) => {
  if (!credentials) {
    throw new Error('User credentials not found.');
  }
  for (const key of required) {
    if (!credentials[key]) {
      throw new Error(`User is missing required credential: ${key}. Please update in settings.`);
    }
  }
  return credentials;
};

/**
 * Sends a message using the user's credentials.
 */
exports.sendMessage = async (userCredentials, payload) => {
  const creds = getCheckedCredentials(userCredentials, ['whatsapp_token', 'phone_number_id']);
  
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.phone_number_id}/messages`;

  const response = await axios({
    method: 'POST',
    url: url,
    headers: {
      'Authorization': `Bearer ${creds.whatsapp_token}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  return response.data;
};

/**
 * Creates a message template using the user's credentials.
 */
exports.createTemplate = async (userCredentials, templateData) => {
  const creds = getCheckedCredentials(userCredentials, ['whatsapp_token', 'whatsapp_business_account_id']);
  
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.whatsapp_business_account_id}/message_templates`;

  const response = await axios({
    method: 'POST',
    url: url,
    headers: {
      'Authorization': `Bearer ${creds.whatsapp_token}`,
      'Content-Type': 'application/json',
    },
    data: templateData,
  });

  return response.data;
};

/**
 * Fetches message templates using the user's credentials.
 */
exports.getTemplates = async (userCredentials, status) => {
    const creds = getCheckedCredentials(userCredentials, ['whatsapp_token', 'whatsapp_business_account_id']);
    
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${creds.whatsapp_business_account_id}/message_templates`;

    const response = await axios({
      method: 'GET',
      url: url,
      headers: {
        'Authorization': `Bearer ${creds.whatsapp_token}`,
      },
      params: {
        fields: 'name,status,language,category,components',
        ...(status && status !== 'ALL' && { status: status.toUpperCase() })
      }
    });
    
    return response.data;
}; 