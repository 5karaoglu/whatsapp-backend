const UserCredentials = require('../models/credentials.model');
const whatsappService = require('../services/whatsapp.service');

const handleServiceCall = async (req, res, serviceFn, ...args) => {
  try {
    console.log('[handleServiceCall] Authenticated user:', JSON.stringify(req.user, null, 2));
    const credentials = await UserCredentials.findOne({ where: { userId: req.user.id } });
    console.log('[handleServiceCall] Found credentials:', JSON.stringify(credentials, null, 2));

    if (!credentials) {
      // Explicitly throw the error that we are seeing in the logs.
      throw new Error('User credentials not found.');
    }

    const result = await serviceFn(credentials, ...args);
    res.json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(`WhatsApp Service Error: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

exports.sendMessage = async (req, res) => {
  // Frontend, WhatsApp API'sine çok benzer bir payload gönderiyor.
  // Bu payload'ı doğrudan alıp zenginleştirmek daha verimli.
  const payloadFromFrontend = req.body;

  // Temel doğrulama
  if (!payloadFromFrontend.to || !payloadFromFrontend.type) {
    return res.status(400).json({ success: false, message: 'Payload "to" ve "type" alanlarını içermelidir.' });
  }

  // Son payload'u oluştur
  const finalPayload = {
    messaging_product: 'whatsapp',
    ...payloadFromFrontend,
  };

  await handleServiceCall(req, res, whatsappService.sendMessage, finalPayload);
};

exports.createTemplate = async (req, res) => {
  // Frontend'den gelen payload'u doğrudan kullan.
  // Frontend, 'components' dizisini WhatsApp API formatına uygun şekilde hazırlıyor.
  const { name, language, category, components } = req.body;

  // Temel doğrulama
  if (!name || !language || !category || !components || !Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ success: false, message: 'name, language, category, and a non-empty components array are required.' });
  }

  const templateData = { name, language, category, components };
  await handleServiceCall(req, res, whatsappService.createTemplate, templateData);
};

exports.getTemplates = async (req, res) => {
  const { status } = req.query;
  await handleServiceCall(req, res, whatsappService.getTemplates, status);
}; 