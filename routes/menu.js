const express = require('express');
const router = express.Router();

const logger = require('./../logger');

router.get('/getall', (req, res, next) => {
  res.json({ message: 'getall' });
});

/*
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

router.post('/new', (req, res, next) => {
  var entity = req.body;
  delete entity.Id;
  db.menu.new(
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
  var entity = req.body;
  db.menu.delete(
    entity.Id,
    (err) => {
      if (err) {
        handleResponse(res, 500, err);
        return;
      }

      handleSuccess(res);
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
  */
module.exports = router;