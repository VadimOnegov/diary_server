(function(routeConfig) {
  'use strict';

  routeConfig.init = function(app) {

    // *** routes *** //
    const routes = require('../routes/index');
    const menuRoutes = require('../routes/menu');

    // *** register routes *** //
    app.use('/', routes);
    app.use('/menu', menuRoutes);
  };
})(module.exports);