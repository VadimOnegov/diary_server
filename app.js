(function() {
  'use strict';

  // Зависимости
  const express = require('express');

  const appConfig = require('./config/main-config.js');
  const routeConfig = require('./config/route-config.js');
  const errorConfig = require('./config/error-config.js');

  // *** express instance *** //
  const app = express();

  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));

  // *** config *** //
  appConfig.init(app, express);
  routeConfig.init(app);
  errorConfig.init(app);

  module.exports = app;
}());
