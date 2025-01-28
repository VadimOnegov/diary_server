const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;

const db = require('../db');

passport.use(new BearerStrategy((token, done) => {
  db.tokens.get(
    token,
    (err, token) => {
      if (err) {
        return done(err);
      }

      return done(null, token);
    });
}
));

module.exports = passport;
