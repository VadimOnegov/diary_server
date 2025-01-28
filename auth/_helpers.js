const bcrypt = require('bcryptjs');
const db = require('../db');
const passport = require('passport');

// Тестовый логин
const testLogins = [process.env.TEST_LOGIN, process.env.TEST_LOGIN2];
const testCode = process.env.TEST_CODE;

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function createLoginValidation(req, res, done, testMode) {
  return handleCreateLoginValidationErrors(req)
    .then((loginReq) => {
      let code = testMode ? testCode : null;

      return db.loginValidations.new(loginReq[0], loginReq[1], done, code);
    })
    .catch((err) => {
      sendCode(res, 400, err.message);
    });
}

function loginValidation(req, res, done) {
  return handleLoginValidationErrors(req)
    .then((loginReq) => {
      return db.loginValidations.validate(loginReq[0], loginReq[1], done);
    })
    .catch((err) => {
      sendCode(res, 400, err.message);
    });
}

function createUser(req, res) {
  return handleUserPasswordErrors(req)
    .then(() => {
      return db.user.new(req.body.username, req.body.password);
    })
    .catch((err) => {
      sendCode(res, 400, err.message);
    });
}

function getToken(login, done, autoCreate) {
  return db.tokens.new(login, done, autoCreate);
}

function tokenRequired(req, res, next) {
  return passport.authenticate('bearer', (err, token) => {
    if (token) {
      req.token = token;
      return next();
    }

    sendCode(res, 401, 'Не верный токен авторизации.');

    return next();
  })(req, res, next);
}

function tokenRedirect(req, res, next) {
  if (req.body.grant_type != "password") {
    return sendCode(res, 401, 'Не верный grant_type.');
  }

  return next();
}

function handleUserPasswordErrors(req) {
  return new Promise((resolve, reject) => {
    if (req.body.username.length < 6) {
      reject({
        message: 'Username must be longer than 6 characters'
      });
    } else if (req.body.password.length < 6) {
      reject({
        message: 'Password must be longer than 6 characters'
      });
    } else {
      resolve();
    }
  });
}

function handleCreateLoginValidationErrors(req) {
  return new Promise((resolve, reject) => {
    let login = req.body.login;
    let clientid = req.body.clientid;

    if (!login) {
      reject({
        message: 'Не указан Login'
      });
    } else {
      resolve([login, clientid]);
    }
  });
}

function handleLoginValidationErrors(req) {
  return new Promise((resolve, reject) => {
    let id = req.body.id;
    let code = req.body.code;

    if (!id) {
      reject({
        message: 'Не указан id'
      });
    } else if (!code) {
      reject({
        message: 'Не указан code'
      });
    } else {
      resolve([id, code]);
    }
  });
}

function sendCode(res, code, msg) {
  var result = res.status(code);

  return msg ? result.json({
    status: msg
  }) : result;
}

module.exports = {
  comparePass,
  createUser,
  createLoginValidation,
  loginValidation,
  getToken,
  tokenRequired,
  tokenRedirect,
  testLogins
};
