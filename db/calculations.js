const knex = require('./connection');

exports.getCK = async function(record) {
  if (!record.ISF) {
    return 0;
  }

  let prevEatingQuery = `
  SELECT d."Id", d."DayDate", dr."Id" as "RecId", dr."RecType", dr."Carbohydrates", dr."EatingType", dr."ParentId", dr."Time", dr."GlucoseStart", 
    dr."GlucoseEnd", dr."CK", dr."ISF", dr."InsulinFact", dr."CKFact", dr."ActiveInsulin"
  FROM public."Days" d
  LEFT JOIN public."DiaryRecord" dr ON dr."DayId" = d."Id"
  WHERE "DayDate" = (SELECT "DayDate" FROM public."Days" WHERE "Id" = `+ record.DayId + `) - interval '1 days' and dr."EatingType" = `+ record.EatingType + `
  `;

  let res = await knex.raw(prevEatingQuery);
  if (!res.rows || res.rows.length == 0) {
    return 0;
  }

  let prevEating = res.rows[0];
  prevEating.GlucoseStart = parseFloat(prevEating.GlucoseStart || '0');
  prevEating.GlucoseEnd = parseFloat(prevEating.GlucoseEnd || '0');
  if (prevEating.GlucoseStart == 0 || prevEating.GlucoseEnd == 0) {
    return 0;
  }

  let sumQuery = `
  SELECT SUM("Carbohydrates") as "Carbohydrates", SUM("Insulin") as "Insulin" FROM public."DiaryRecord" WHERE "ParentId" =  `+ prevEating.RecId + `
  `;

  res = await knex.raw(sumQuery);
  if (!res.rows || res.rows.length == 0) {
    return 0;
  }

  let sums = res.rows[0];
  sums.Insulin = parseFloat(sums.Insulin || '0');
  sums.Carbohydrates = parseFloat(sums.Carbohydrates || '0');

  prevEating.ActiveInsulin = parseFloat(prevEating.ActiveInsulin || '0');
  if (prevEating.ActiveInsulin) {
    sums.Insulin += prevEating.ActiveInsulin;
  }
  let carbohydrates = sums.Carbohydrates + parseFloat(prevEating.Carbohydrates || '0');
  let ck = carbohydrates ?
    (sums.Insulin + ((prevEating.GlucoseEnd - prevEating.GlucoseStart) / record.ISF)) / carbohydrates :
    0;

  return ck;
};

exports.getCKFact = async function(record) {
  if (!record) {
    return 0;
  }

  let glucoseStart = parseFloat(record.GlucoseStart || '0');
  let glucoseEnd = parseFloat(record.GlucoseEnd || '0');
  let ISF = parseFloat(record.ISF || '0');
  if (!record.GlucoseStart || !record.GlucoseEnd || !record.ISF){
    return 0;
  }

  let carbohydrates = parseFloat(record.Carbohydrates || '0');
  let activeInsulin = parseFloat(record.ActiveInsulin || '0');

  let sumQuery = `
  SELECT SUM("Carbohydrates") as "Carbohydrates", SUM("Insulin") as "Insulin" FROM public."DiaryRecord" WHERE "ParentId" =  `+ record.Id + `
  `;

  res = await knex.raw(sumQuery);
  if (!res.rows || res.rows.length == 0) {
    return 0;
  }

  let sums = res.rows[0];
  carbohydrates += parseFloat(sums.Carbohydrates || '0');
  let insulin = activeInsulin + parseFloat(sums.Insulin || '0');

  if (carbohydrates == 0) {
    return 0;
  }

  let ck = (insulin + (glucoseEnd - glucoseStart) / ISF) / carbohydrates;
  return ck;
};

exports.getISF = async function(record) {
  let query = `
  SELECT d."Id", d."DayDate", dr."Id" as "RecId", dr."RecType", dr."Insulin", dr."InsulinType", dr."EatingType", dr."ParentId", dr."Time"
  FROM public."Days" d
  LEFT JOIN public."DiaryRecord" dr ON dr."DayId" = d."Id"
  WHERE "DayDate" < (SELECT "DayDate" FROM public."Days" WHERE "Id" = `+ record.DayId + `) 
    and "DayDate" > (SELECT "DayDate" FROM public."Days" WHERE "Id" = `+ record.DayId + `) - interval '4 days' 
  	and ((dr."EatingType" <> 4 and dr."EatingType" <> 5) or dr."RecType" = 2) and (dr."InsulinType" = 0 or dr."RecType" = 0)
  ORDER BY d."DayDate" DESC, dr."Time" ASC, dr."RecType" ASC
  `;
  let res = await knex.raw(query);

  let lastTime = null;
  let currentDay = null;
  let insulin = 0;
  let dayCount = 0;
  for (let i = 0; i < res.rows.length; i++) {
    let row = res.rows[i];
    if (currentDay != row.Id) {
      lastTime = null;
      currentDay = row.Id;
      dayCount++;
    }

    if (row.RecType === '0') {
      lastTime = row.Time;
    }

    if (row.RecType === '2' && lastTime !== null) { // Ночные подколки не учитываем при рассчете ФЧИ
      insulin += parseFloat(row.Insulin || 0);
    }
  }

  let result = dayCount == 0 ? 0 : 100 / (insulin / dayCount);
  return result;
};

exports.getActiveInsulin = async function(record) {
  let query = `
  SELECT "Insulin", 
    EXTRACT(HOUR FROM TIME WITHOUT TIME ZONE '`+ record.Time + `' - "Time") + EXTRACT(MINUTE FROM TIME WITHOUT TIME ZONE '`+ record.Time + `' - "Time")/60 + EXTRACT(SECOND FROM TIME WITHOUT TIME ZONE '`+ record.Time + `' - "Time")/3600 as "Time"
  FROM public."DiaryRecord"
  WHERE "DayId" = `+ record.DayId + ` and "RecType" = 2 and "InsulinType" = 0 and "Time" > TIME WITHOUT TIME ZONE '`+ record.Time + `' - interval '5 hours' and "Time" < TIME WITHOUT TIME ZONE '`+ record.Time + `';
  `;

  let res = await knex.raw(query);

  if (!res.rows || res.rows.length == 0) {
    return 0;
  }

  let activeInsulin = 0;
  for (let i = 0; i < res.rows.length; i++) {
    let row = res.rows[i];
    activeInsulin += regressInsulin(parseFloat(row.Time || 0), parseFloat(row.Insulin || 0));
  }

  return activeInsulin;
};

regressInsulin = function(count, value) {
  if (count >= 0 && count < 1)
  {
    return value * (100 - 25 * count) / 100;
  }
  else if(count >= 1 && count < 2)
  {
    return value * (110 - 35 * count) / 100;
  }
  else if (count >= 2 && count < 3)
  {
    return value * (90 - 25 * count) / 100;
  }
  else if (count >= 3 && count < 4)
  {
    return value * (45 - 10 * count) / 100;
  }
  else if (count >= 4 && count < 5)
  {
    return value * (25 - 5 * count) / 100;
  }
  else
  {
    return 0;
  }
};