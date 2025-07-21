const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const axios = require('axios');
const User = require('../models/user.model');
const UserCredentials = require('../models/credentials.model');
require('dotenv').config();

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, JWT_SECRET } = process.env;

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !JWT_SECRET) {
  throw new Error('Facebook App credentials or JWT Secret are not defined in .env file.');
}

// --- Facebook Token Strategy: Now includes fetching WhatsApp credentials ---
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      fbGraphVersion: 'v19.0',
    },
    async (shortLivedToken, refreshToken, profile, done) => {
      try {
        // Step 1: Debug the short-lived token to verify it and get the user ID securely
        const debugUrl = `https://graph.facebook.com/debug_token?input_token=${shortLivedToken}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`;
        const debugResponse = await axios.get(debugUrl);
        const { user_id, is_valid } = debugResponse.data.data;

        if (!is_valid) {
          return done(new Error('The provided Facebook token is not valid.'), null);
        }

        const facebookId = user_id;
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${facebookId}@facebook.placeholder.com`;
        const name = profile.displayName;

        // Step 2: Find or create the user in our database
        const [user, created] = await User.findOrCreate({
          where: { facebookId: facebookId },
          defaults: { facebookId, name, email },
        });
        
        // Step 3: Exchange the short-lived token for a long-lived one using the correct Graph API flow
        const longLivedTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
        const tokenResponse = await axios.get(longLivedTokenUrl);
        const longLivedToken = tokenResponse.data.access_token;

        // Step 4: Fetch user's WhatsApp Business Accounts (WABA) using the new long-lived token
        const businessesUrl = `https://graph.facebook.com/v19.0/me/businesses?access_token=${longLivedToken}`;
        const businessesResponse = await axios.get(businessesUrl);
        if (!businessesResponse.data.data || businessesResponse.data.data.length === 0) {
          return done(new Error('No Facebook Business Account found for this user.'), null);
        }
        const businessId = businessesResponse.data.data[0].id;

        const ownedWabaUrl = `https://graph.facebook.com/${businessId}/owned_whatsapp_business_accounts?access_token=${longLivedToken}`;
        const ownedWabaResponse = await axios.get(ownedWabaUrl);
        if (!ownedWabaResponse.data.data || ownedWabaResponse.data.data.length === 0) {
          return done(new Error('No WhatsApp Business Account found for this business.'), null);
        }
        const wabaId = ownedWabaResponse.data.data[0].id;

        // Step 5: Fetch Phone Number ID from the WABA
        const phoneNumbersUrl = `https://graph.facebook.com/v19.0/${wabaId}/phone_numbers?access_token=${longLivedToken}`;
        const phoneNumbersResponse = await axios.get(phoneNumbersUrl);
        if (!phoneNumbersResponse.data.data || phoneNumbersResponse.data.data.length === 0) {
          return done(new Error('No phone numbers found for this WhatsApp Business Account.'), null);
        }
        const phoneNumberId = phoneNumbersResponse.data.data[0].id;

        // Step 6: Save or update the credentials
        const [credentials, isCreated] = await UserCredentials.findOrCreate({
          where: { userId: user.id },
          defaults: { userId: user.id, whatsapp_token: longLivedToken, whatsapp_business_account_id: wabaId, phone_number_id: phoneNumberId }
        });

        if (!isCreated) {
          credentials.whatsapp_token = longLivedToken;
          credentials.whatsapp_business_account_id = wabaId;
          credentials.phone_number_id = phoneNumberId;
          await credentials.save();
        }
        
        return done(null, user);
      } catch (error) {
        console.error("Error in FacebookTokenStrategy:", error.response ? error.response.data.error : error.message);
        return done(error, null);
      }
    }
  )
);

// --- JWT Strategy for protecting routes ---
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findByPk(jwt_payload.id);
      if (user) {
        return done(null, user); // User found, attach to req.user
      } else {
        return done(null, false); // User not found
      }
    } catch (error) {
      return done(error, false);
    }
  })
);


module.exports = passport; 