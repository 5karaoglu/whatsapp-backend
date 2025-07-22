const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors'); // Nginx CORS'u yönettiği için artık gerekli değil.
const passport = require('passport');
const morgan = require('morgan'); // Morgan'ı import et
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const credentialsRoutes = require('./routes/credentials.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
require('dotenv').config();
require('./config/passport');

const app = express();
const port = process.env.PORT || 5001;

// --- Debug Mode ---
// Ortam değişkeni DEBUG_MODE=true ise, detaylı istek loglarını etkinleştir.
if (process.env.DEBUG_MODE === 'true') {
  app.use(morgan('dev'));
}

// Middleware
// CORS ayarları kaldırıldı. Bu sorumluluk tamamen Nginx'e devredildi.
// const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
// };
// app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/', (req, res) => {
  res.send('WhatsApp Management Backend is running!');
});

// --- Database Sync and Server Start ---
const startServer = async () => {
  try {
    await sequelize.sync({ alter: true }); // { alter: true } helps to update table schema without losing data
    console.log('Database synced successfully.');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
    process.exit(1);
  }
};

startServer(); 