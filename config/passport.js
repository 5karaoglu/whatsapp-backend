const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user.model');
const UserCredentials = require('../models/credentials.model');
require('dotenv').config();

const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, JWT_SECRET } = process.env;

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !JWT_SECRET) {
  throw new Error('Facebook App credentials or JWT Secret are not defined in .env file.');
}

// --- Facebook Token Strategy for Login ---
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      fbGraphVersion: 'v19.0',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const facebookId = profile.id;
        // Use the correct field name from the User model: 'name'
        const name = profile.displayName; 
        
        // Handle cases where email is null, undefined, or an empty string
        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          // If no email, create a placeholder email to satisfy db constraints (unique, not null, isEmail)
          email = `${facebookId}@facebook.placeholder.com`;
        }

        const [user, created] = await User.findOrCreate({
          where: { facebookId: facebookId },
          defaults: {
            facebookId: facebookId,
            name: name, // Use 'name' instead of 'displayName'
            email: email, 
          },
        });

        if (!created) {
          // If user already exists, check if we need to update their info
          let needsUpdate = false;
          // Only update email if a new, valid email is provided
          const newValidEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (newValidEmail && user.email !== newValidEmail) {
            user.email = newValidEmail;
            needsUpdate = true;
          }
          if (name && user.name !== name) {
            user.name = name;
            needsUpdate = true;
          }
          if (needsUpdate) {
            await user.save();
          }
        } else {
          // If a new user is created, also create an empty credentials entry
          await UserCredentials.create({ userId: user.id });
        }
        
        return done(null, user); // Pass user object to the next middleware
      } catch (error) {
        console.error("Error in FacebookTokenStrategy:", error);
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