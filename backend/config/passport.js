// config/passport.js  –  fixed
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User           = require("../models/User");

// ── Google Strategy ───────────────────────────────────────────
// FIX: Was finding users by email only — if a user changes their Google
//      email address a duplicate account gets created.
//      Now finds by googleId first (correct), falls back to email for
//      migration of existing accounts.
// FIX: Saves googleId onto the user record so future logins are robust.
// FIX: callbackURL should be read from env so it works in staging/dev too.
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL || "https://mak-iqvm.onrender.com/api/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleEmail = profile.emails?.[0]?.value?.toLowerCase();

      // 1. Find by googleId (preferred — stable even if email changes)
      let user = await User.findOne({ googleId: profile.id });

      // 2. Migrate legacy record that was matched by email only
      if (!user && googleEmail) {
        user = await User.findOne({ email: googleEmail });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        }
      }

      // 3. Brand-new user
      if (!user) {
        user = new User({
          name:     profile.displayName,
          email:    googleEmail,
          googleId: profile.id,
          password: null, // no local password for OAuth-only users
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});