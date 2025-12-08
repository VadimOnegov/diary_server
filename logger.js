var logger = require('intel');

logger.setLevel(logger.INFO);
logger.addHandler(new logger.handlers.File({
  file: './log/serverlog.log',
  formatter: new logger.Formatter({
    format: '[%(date)s] %(levelname)s: %(message)s'
  })
}));
//logger.addHandler(new logger.handlers.Console());

module.exports = logger;
