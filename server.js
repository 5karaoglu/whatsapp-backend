const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const passport = require('./config/passport');
const sequelize = require('./config/database');

// Routes
const authRoutes = require('./routes/auth.routes');
const credentialsRoutes = require('./routes/credentials.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();
const port = process.env.PORT || 5001;

// --- Middlewares ---

// Explicitly configure CORS to allow requests from your frontend's origin
const corsOptions = {
  origin: 'https://artibo.maivo.com.tr',
  optionsSuccessStatus: 200 // For legacy browser support
};

// Use CORS with options
app.use(cors(corsOptions));

// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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