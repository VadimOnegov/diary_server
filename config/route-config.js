exports.init = function(app) {
  // *** routes *** //
  const routes = require('../routes/index');
  const menuRoutes = require('../routes/menu');
  //const daysRoutes = require('../routes/days');

  // *** register routes *** //
  app.use('/', routes);
  app.use('/menu', menuRoutes);
  //app.use('/days', daysRoutes);
}