
import express from 'express';
import appConfig from './config/main-config.js';
import routeConfig from './config/route-config.js';
import errorConfig from './config/error-config.js';

const app = express();

// *** config *** //
appConfig.init(app, express);
routeConfig.init(app);
errorConfig.init(app);

//app.get('/', (req, res) => {
//  res.json({ message: 'Hello from Express on Vercel!' });
//});
 
// Export the Express app
export default app;