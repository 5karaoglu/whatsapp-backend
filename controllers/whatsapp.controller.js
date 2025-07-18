const UserCredentials = require('../models/credentials.model');
const whatsappService = require('../services/whatsapp.service');

const handleServiceCall = async (req, res, serviceFn, ...args) => {
  try {
    const credentials = await UserCredentials.findOne({ where: { userId: req.user.id } });
    const result = await serviceFn(credentials, ...args);
    res.json({ success: true, data: result });
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error(`WhatsApp Service Error: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
};

exports.sendMessage = async (req, res) => {
  const { recipientNumber, messageType, messageText, template } = req.body;
  let payload = { messaging_product: 'whatsapp', to: recipientNumber };

  if (messageType === 'text') {
    payload.type = 'text';
    payload.text = { body: messageText };
  } else if (messageType === 'template') {
    payload.type = 'template';
    payload.template = {
      name: template.name,
      language: { code: template.language },
      components: template.components || [],
    };
  } else {
    return res.status(400).json({ success: false, message: 'Invalid message type.' });
  }

  await handleServiceCall(req, res, whatsappService.sendMessage, payload);
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