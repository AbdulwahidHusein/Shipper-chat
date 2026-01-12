import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {
  findUserByGoogleId,
  findUserByEmail,
  createUser,
  updateUser,
  findUserById,
} from '../services/user.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName: name, emails, photos } = profile;
        const email = emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email provided by Google'), undefined);
        }

        // Check if user exists by Google ID
        let user = await findUserByGoogleId(googleId);

        if (user) {
          // Update user info if needed
          user = await updateUser(user.id, {
            name,
            picture: photos?.[0]?.value,
            isOnline: true,
            lastSeen: new Date(),
          });
          return done(null, user);
        }

        // Check if user exists by email (in case they signed up differently)
        user = await findUserByEmail(email);

        if (user) {
          // Update with Google ID if missing
          user = await updateUser(user.id, {
            name,
            picture: photos?.[0]?.value,
            isOnline: true,
            lastSeen: new Date(),
          });
          return done(null, user);
        }

        // Create new user
        user = await createUser({
          email,
          name,
          picture: photos?.[0]?.value,
          googleId,
        });

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
