const tablename = 'Days';
const knex = require('./connection');

const calculations = require('./calculations');

exports.data = getData();

exports.addDay = function(day, done) {
  return getData()
    .insert(day)
    .returning('Id')
    .then(res => {
      return done(null, res);
    }).catch((err) => {
      return done(err);
    });
};

exports.deleteDay = async function(id, done) {
  await knex('Days').where({ Id: id }).delete();
};

exports.newRecord = function(record, done) {
  record.DateTime = new Date();
  return knex('DiaryRecord')
    .insert(record)
    .returning('Id')
    .then(res => {
      return done(null, res);
    }).catch((err) => {
      return done(err);
    });
};

exports.saveRecord = function(record, done) {
  return knex('DiaryRecord')
    .where({
      Id: record.Id
    })
    .update(record)
    .then(item => {
      if (!item) {
        throw {
          message: 'Позиция меню не найдена!'
        };
      }

      return done(null, item);
    })
    .catch((err) => {
      return done(err);
    });
};

exports.deleteRecord = async function(id, done) {
  await knex('Eating').where({ DiaryRecordId: id }).delete();
  await knex('DiaryRecord').where({ ParentId: id }).delete();
  await knex('DiaryRecord').where({ Id: id }).delete();
};

exports.newEating = async function(record) {
  record.DateTime = new Date();
  record.ISF = await calculations.getISF(record);
  record.CK = await calculations.getCK(record);
  record.ActiveInsulin = await calculations.getActiveInsulin(record);
  let newId = await knex('DiaryRecord').insert(record).returning("Id");
  let newEntity = await knex('DiaryRecord').where('Id', newId[0].Id).first();
  newEntity.Eating = [];
  newEntity.DiaryRecords = [];
  let times = newEntity.Time.split(':');
  newEntity.Time = times[0] + ':' + times[1];
  return newEntity;
};

exports.saveEating = async function(record) {
  await knex('DiaryRecord').where({Id: record.Id}).update(record);
  let savedEntity = await exports.getEating(record.Id);
  return savedEntity;
};

exports.newEatingItem = async function(item) {
  let recId = item.DiaryRecordId;
  await knex('Eating').insert(item);
  return await recalculateCarbohydrates(recId);
};

exports.saveEatingItem = async function(item) {
  let recId = item.DiaryRecordId;
  await knex('Eating').where({Id: item.Id}).update(item);
  return await recalculateCarbohydrates(recId);
};

exports.deleteEatingItem = async function(item) {
  let recId = item.DiaryRecordId;
  await knex('Eating').where({Id: item.Id}).delete();;
  return await recalculateCarbohydrates(recId);
};

exports.newStartGlucoseTest = async function(record) {
  let recId = record.ParentId;
  let time = record.Time;
  record.DateTime = new Date();
  await knex('DiaryRecord').insert(record);
  await knex('DiaryRecord').where({Id: recId}).update({GlucoseStart: record.Glucose, Time: time});
  return await exports.getEating(recId);
};

exports.saveStartGlucoseTest = async function(record) {
  let recId = record.ParentId;
  await knex('DiaryRecord').where({Id: record.Id}).update(record);
  await knex('DiaryRecord').where({Id: recId}).update({GlucoseStart: record.Glucose});
  return await exports.getEating(recId);
};

exports.newEndGlucoseTest = async function(record) {
  let recId = record.ParentId;
  let time = record.Time;
  record.DateTime = new Date();
  await knex('DiaryRecord').insert(record);
  await knex('DiaryRecord').where({Id: recId}).update({GlucoseEnd: record.Glucose});
  let rec = await knex('DiaryRecord').where({Id: recId}).first();
  let ckFact = await calculations.getCKFact(rec);
  await knex('DiaryRecord').where({Id: recId}).update({CKFact: ckFact});
  return await exports.getEating(recId);
};

exports.newStartInsulinInjection = async function(record) {
  let recId = record.ParentId;
  let time = record.Time;
  record.DateTime = new Date();
  await knex('DiaryRecord').insert(record);
  await knex('DiaryRecord').where({Id: recId}).update({InsulinFact: record.Insulin, Time: time});
  return await exports.getEating(recId);
};

exports.calculateCK = async function(id) {
  let record = await knex('DiaryRecord').where({Id: id}).first();
  let isf = await calculations.getISF(record);
  let ck = await calculations.getCK(record);
  await knex('DiaryRecord').where({Id: id}).update({ISF: isf, CK: ck});
  return await exports.getEating(id);
};

exports.calculateFactCK = async function(id) {
  let record = await knex('DiaryRecord').where({Id: id}).first();
  let ckFact = await calculations.getCKFact(record);
  await knex('DiaryRecord').where({Id: id}).update({CKFact: ckFact});
  return await exports.getEating(id);
};

exports.calculateActiveInsulin = async function(id) {
  let record = await knex('DiaryRecord').where({Id: id}).first();
  let activeInsulin = await calculations.getActiveInsulin(record);
  await knex('DiaryRecord').where({Id: id}).update({ActiveInsulin: activeInsulin});
  return await exports.getEating(id);
};

exports.getEating = async function(recordId) {
  let query = `
  SELECT dr."Id", dr."RecType", dr."DateTime", dr."Glucose", dr."Carbohydrates", dr."Insulin", dr."Comment", dr."InsulinType", dr."TesterType", dr."EatingType", 
    dr."ParentId", dr."DayId", dr."Time", dr."GlucoseStart", dr."GlucoseEnd", dr."CK", dr."ISF", dr."InsulinFact", dr."CKFact", dr."ActiveInsulin", 
    dr."StartEat", dr."Pause", 
    e."Id" as "EatingId", m."Name" as "EatName", m."WeightType", e."IsPutoff", e."Weight", e."Сarbohydrates", e."PFU", e."Proteins", e."Fats", e."MenuId"
  FROM public."DiaryRecord" dr
  LEFT JOIN public."Eating" e on e."DiaryRecordId" = dr."Id"
  LEFT JOIN public."Menu" m on e."MenuId" = m."Id"
  WHERE dr."Id" = ` + recordId + ` or dr."ParentId" = ` + recordId + `
  ORDER BY "ParentId" DESC, "Time"
  `;

  let res = await knex.raw(query);
  if (!res.rows || res.rows.length == 0) {
    return {};
  }

  var rec = rowToDiaryRecord(res.rows[0]);
  for (let i = 0; i < res.rows.length; i++) {
    let row = res.rows[i];
    if (row.Id === recordId && row.EatingId) {
      rec.Eating.push(rowToEatingRecord(row));
    }

    if (row.ParentId === recordId) {
      rec.DiaryRecords.push(rowToDiaryRecord(row));
    }
  }

  return rec;
};

exports.getAll = function(done) {
  let query = `
  SELECT d."Id" as "DayId", d."DayDate", dr."Id" as "Id", dr."RecType", dr."Glucose", dr."Carbohydrates", dr."Insulin", 
    dr."Comment", dr."InsulinType", dr."TesterType", dr."EatingType", dr."ParentId", dr."Time", dr."GlucoseStart", 
    dr."GlucoseEnd", dr."CK", dr."ISF", dr."InsulinFact", dr."CKFact", dr."ActiveInsulin", dr."StartEat", dr."Pause",
    e."Id" as "EatingId", m."Name" as "EatName", m."WeightType", e."IsPutoff", e."Weight", e."Сarbohydrates", e."PFU", e."Proteins", e."Fats", e."MenuId"
  FROM public."Days" d
  LEFT JOIN public."DiaryRecord" dr ON dr."DayId" = d."Id"
  LEFT JOIN public."Eating" e on e."DiaryRecordId" = dr."Id"
  LEFT JOIN public."Menu" m on e."MenuId" = m."Id"
  WHERE d."DayDate" > current_date - interval '7 days'
  ORDER BY d."DayDate" DESC, d."Id" DESC, dr."ParentId" DESC, dr."Time" ASC
  `;

  return knex.raw(query)
    .then(res => {
      if (!res || !res.rows) {
        return done(null, []);
      }
      
      let days = [];
      let currentDay = {};
      let currentParentRecord = {};
      let currentRecord = {};
      for (let i = 0; i < res.rows.length; i++) {
        var row = res.rows[i];
        if (row.DayId != currentDay.Id) {
          currentDay = {
            Id: row.DayId,
            DayDate: row.DayDate.toLocaleDateString('ru-Ru'),
            DiaryRecords: []
          };

          days.push(currentDay);
        }
        
        if (row.Id) {
          if (currentRecord.Id != row.Id) {
            currentRecord = rowToDiaryRecord(row);
            if (row.ParentId === null) {
              currentParentRecord = currentRecord
              currentDay.DiaryRecords.push(currentRecord);
            } else {
              if (currentParentRecord.Id !== currentRecord.ParentId) {
                currentParentRecord = currentDay.DiaryRecords.find((item) => item.Id === currentRecord.ParentId);
              }

              if (currentParentRecord) {
                currentParentRecord.DiaryRecords.push(currentRecord);
              }
            }
          }

          if (row.EatingId) {
            currentRecord.Eating.push(rowToEatingRecord(row));
          }
        }
      }

      return done(null, days);
    })
    .catch((err) => {
      return done(err);
    });
};

async function recalculateCarbohydrates(recId) {
  var sumQuery = `
  SELECT SUM("Сarbohydrates") as total FROM public."Eating" WHERE "DiaryRecordId" = ` + recId + ` and "IsPutoff" = false;
  `;

  let total = 0;
  let res = await knex.raw(sumQuery);
  if (res.rows && res.rows.length > 0) {
    total = res.rows[0].total;
  }

  await knex('DiaryRecord').where({Id: recId}).update({Carbohydrates: total});
  return await exports.getEating(recId);
};

function rowToEatingRecord(row) {
  return {
    Id: row.EatingId,
    DiaryRecordId: row.Id,
    MenuId: row.MenuId,
    EatName: row.EatName,
    WeightType: row.WeightType,
    IsPutoff: row.IsPutoff,
    Weight: row.Weight,
    Сarbohydrates: row.Сarbohydrates,
    Proteins: row.Proteins,
    Fats: row.Fats,
  };
};

function rowToDiaryRecord(row) {
  let times = row.Time.split(':');
  let time = times[0] + ':' + times[1];
  return {
    Id: row.Id,
    DayId: row.DayId,
    RecType: row.RecType,
    Glucose: row.Glucose,
    Carbohydrates: row.Carbohydrates,
    Insulin: row.Insulin,
    Comment: row.Comment,
    InsulinType: row.InsulinType,
    TesterType: row.TesterType,
    EatingType: row.EatingType,
    ParentId: row.ParentId,
    Time: time,
    GlucoseStart: row.GlucoseStart,
    GlucoseEnd: row.GlucoseEnd,
    CK: row.CK,
    ISF: row.ISF,
    InsulinFact: row.InsulinFact,
    CKFact: row.CKFact,
    ActiveInsulin: row.ActiveInsulin,
    StartEat: row.StartEat,
    Pause: row.Pause,
    Eating: [],
    DiaryRecords: []
  };
};

function getData() {
  return knex(tablename);
};