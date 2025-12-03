import express from 'express';
import appConfig from './config/main-config.js'
import routeConfig from './config/route-config.js'
import errorConfig from './config/error-config.js'


const app = express();
 
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// *** config *** //
appConfig.init(app, express);
routeConfig.init(app);
errorConfig.init(app);
  
export default app;