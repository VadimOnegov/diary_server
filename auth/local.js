const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../db');

const authHelpers = require('./_helpers');
const options = {
  usernameField: 'login'
};

passport.use(new LocalStrategy(options, (login, password, done) => {
  db.users.findByLogin(
    login,
    (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) return done(null, false);

      if (!authHelpers.comparePass(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    });
}));

module.exports = passport;
