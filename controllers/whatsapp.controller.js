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
  const { name, language, category, headerText, bodyText, footerText } = req.body;
  const components = [];
  if (headerText) components.push({ type: 'HEADER', format: 'TEXT', text: headerText });
  if (bodyText) components.push({ type: 'BODY', text: bodyText });
  if (footerText) components.push({ type: 'FOOTER', text: footerText });

  const templateData = { name, language, category, components };
  await handleServiceCall(req, res, whatsappService.createTemplate, templateData);
};

exports.getTemplates = async (req, res) => {
  const { status } = req.query;
  await handleServiceCall(req, res, whatsappService.getTemplates, status);
}; 