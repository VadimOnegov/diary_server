const express = require('express');
const router = express.Router();

const logger = require('./../logger');

const authHelpers = require('../auth/_helpers');
const db = require('./../db');

router.get('/getall', (req, res, next) => {
  db.menu.getAll(
    (err, menu) => {
      if (err) {
        handleResponse(res, 500, err);
        return;
      }

      res.send(menu || []);
    });
});

router.post('/save', (req, res, next) => {
  var entity = req.body;

  db.menu.save(
    entity,
    (err, profile) => {
      if (err) {
        handleResponse(res, 500, err);
        return;
      }

      if (profile) {
        handleSuccess(res);
      }
    });
});

router.post('/delete', (req, res, next) => {
  db.menu.delete(
    req.body.id,
    (err, profile) => {
      if (err) {
        handleResponse(res, 500, err);
        return;
      }

      if (profile) {
        handleSuccess(res);
      }
    });
});

function handleResponse(res, code, statusMsg) {
  logger.warn(statusMsg);
  res.status(code).json({
    status: statusMsg
  });
}

function handleSuccess(res) {
  res.status(200).json({});
}
  
  module.exports = router;