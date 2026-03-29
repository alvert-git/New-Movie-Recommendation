const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./connectDB'); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:9000/api/auth/google/callback" // Using absolute URL is safer
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const photo = profile.photos[0]?.value; // Extract the Google Profile Picture

        // 1. Check if user exists by google_id
        let [users] = await db.query('SELECT * FROM users WHERE google_id = ?', [googleId]);

        if (users.length > 0) {
            // Update the photo in case they changed it on Google
            await db.query('UPDATE users SET profile_pic = ? WHERE google_id = ?', [photo, googleId]);
            const updatedUser = { ...users[0], profile_pic: photo };
            return done(null, updatedUser);
        }

        // 2. Check email conflict (User registered locally first)
        let [existingEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingEmail.length > 0) {
            // Link the Google account to the existing local email
            await db.query(
                'UPDATE users SET google_id = ?, auth_provider = "google", profile_pic = ? WHERE email = ?', 
                [googleId, photo, email]
            );
            const updatedUser = { ...existingEmail[0], google_id: googleId, profile_pic: photo, auth_provider: 'google' };
            return done(null, updatedUser);
        }

        // 3. Create new Google User
        const [result] = await db.query(
            'INSERT INTO users (email, google_id, auth_provider, profile_pic) VALUES (?, ?, ?, ?)',
            [email, googleId, 'google', photo]
        );
        
        const newUser = { id: result.insertId, email, google_id: googleId, profile_pic: photo, role: 'user' };
        return done(null, newUser);
        
    } catch (err) {
        return done(err, null);
    }
  }
));