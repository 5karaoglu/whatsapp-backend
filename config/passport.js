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
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!email) {
          // Log the profile to see what we received from Facebook
          console.error('Facebook profile did not return an email. Profile:', JSON.stringify(profile, null, 2));
          return done(new Error('Facebook profile did not return an email.'), null);
        }

        const [user, created] = await User.findOrCreate({
          where: { email: email },
          defaults: {
            facebookId: profile.id,
            displayName: profile.displayName,
            email: email,
          },
        });

        if (created) {
          // If a new user is created, also create an empty credentials entry for them
          await UserCredentials.create({ userId: user.id });
        }
        
        return done(null, user); // Pass user object to the next middleware
      } catch (error) {
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