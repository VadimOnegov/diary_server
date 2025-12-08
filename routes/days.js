const express = require('express');
const router = express.Router();

//const logger = require('./../logger');

const authHelpers = require('../auth/_helpers');
const db = require('./../db');

router.post('/addDay', (req, res, next) => {
  var entity = req.body;
  delete entity.Id;
  db.days.addDay(
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

router.post('/deleteDay', async (req, res, next) => {
  try {
    var entity = req.body;
    await db.days.deleteDay(entity.Id);
    handleSuccess(res);
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.get('/getall', (req, res, next) => {
  db.days.getAll(
    (err, days) => {
      if (err) {
        handleResponse(res, 500, err);
        return;
      }

      res.send(days || []);
    });
});

router.post('/saveRecord', (req, res, next) => {
  var entity = getRecordFromBody(req);
  db.days.saveRecord(
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

router.post('/newRecord', (req, res, next) => {
  var entity = getRecordFromBody(req);
  delete entity.Id;
  db.days.newRecord(
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

router.post('/deleteRecord', async (req, res, next) => {
  try {
    var entity = req.body;
    var newEntity = await db.days.deleteRecord(entity.Id);
    handleSuccess(res);
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/newEating', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    delete entity.Id;
    var newEntity = await db.days.newEating(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/saveEating', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    var newEntity = await db.days.saveEating(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/getEating', async (req, res, next) => {
  try {
    var id = req.body.Id;
    var newEntity = await db.days.getEating(id);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/newEatingItem', async (req, res, next) => {
  try {
    var entity = getEatingItemFromBody(req);
    delete entity.Id;
    var newEntity = await db.days.newEatingItem(entity);
  res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/saveEatingItem', async (req, res, next) => {
  try {
    var entity = getEatingItemFromBody(req);
    var newEntity = await db.days.saveEatingItem(entity);
  res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/deleteEatingItem', async (req, res, next) => {
  try {
    var entity = getEatingItemFromBody(req);
    var newEntity = await db.days.deleteEatingItem(entity);
  res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/newStartGlucoseTest', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    delete entity.Id;
    var newEntity = await db.days.newStartGlucoseTest(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/saveStartGlucoseTest', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    var newEntity = await db.days.saveStartGlucoseTest(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/newEndGlucoseTest', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    delete entity.Id;
    var newEntity = await db.days.newEndGlucoseTest(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/newStartInsulinInjection', async (req, res, next) => {
  try {
    var entity = getRecordFromBody(req);
    delete entity.Id;
    var newEntity = await db.days.newStartInsulinInjection(entity);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/calculateCK', async (req, res, next) => {
  try {
    var id = req.body.Id;
    var newEntity = await db.days.calculateCK(id);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/calculateFactCK', async (req, res, next) => {
  try {
    var id = req.body.Id;
    var newEntity = await db.days.calculateFactCK(id);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

router.post('/calculateActiveInsulin', async (req, res, next) => {
  try {
    var id = req.body.Id;
    var newEntity = await db.days.calculateActiveInsulin(id);
    res.send(newEntity || {});
  } catch (e) {
    handleResponse(res, 500, e);
  }
});

function handleResponse(res, code, statusMsg) {
  //logger.warn(statusMsg);
  res.status(code).json({
    status: statusMsg
  });
};

function handleSuccess(res) {
  res.status(200).json({});
};

function getEatingItemFromBody(req) {
  return {
    Id: req.body.Id,
    DiaryRecordId: req.body.DiaryRecordId,
    MenuId: req.body.MenuId,
    IsPutoff: req.body.IsPutoff || false,
    Weight: req.body.Weight,
    Сarbohydrates: req.body.Сarbohydrates,
    Proteins: req.body.Proteins,
    Fats: req.body.Fats,
  }
};

function getRecordFromBody(req) {
  return {
    Id: req.body.Id,
    DayId: req.body.DayId,
    RecType: req.body.RecType,
    Glucose: req.body.Glucose,
    Carbohydrates: req.body.Carbohydrates,
    Insulin: req.body.Insulin,
    Comment: req.body.Comment,
    InsulinType: req.body.InsulinType,
    TesterType: req.body.TesterType,
    EatingType: req.body.EatingType,
    ParentId: req.body.ParentId,
    Time: req.body.Time,
    GlucoseStart: req.body.GlucoseStart,
    GlucoseEnd: req.body.GlucoseEnd,
    CK: req.body.CK,
    ISF: req.body.ISF,
    InsulinFact: req.body.InsulinFact,
    CKFact: req.body.CKFact,
    ActiveInsulin: req.body.ActiveInsulin,
    StartEat: req.body.StartEat,
    Pause: req.body.Pause,
  };
};

function getDayFromBody(req) {
  return {
    Id: req.body.Id,
    DayDate: req.body.DayDate,
  };
};
  
module.exports = router;