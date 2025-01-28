(function(appConfig) {
  'use strict';

  // Зависимости
  var path = require('path');
  const bodyParser = require('body-parser');
  const morgan = require('morgan');
  const passport = require('passport');

  // Загрузка переменных окружения
  require('dotenv').config();

  appConfig.init = function(app, express) {
    // *** view engine *** //
    app.set('view engine', 'pug');

    // Перенаправление статики
    app.use(express.static(path.join(__dirname, 'public')));

    // *** app middleware *** //
    if (process.env.NODE_ENV !== 'test') {
      app.use(morgan('dev'));
    }

    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    //app.use(passport.initialize());
    //app.use(passport.session());
  }
})(module.exports);
