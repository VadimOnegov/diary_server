const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ message: 'Hello from Express on Vercel!' });//res.render('index');
});

module.exports = router;
