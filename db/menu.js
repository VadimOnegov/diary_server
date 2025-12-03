const tablename = 'Menu';
const knex = require('./connection');

// public
exports.data = getData();

exports.getAll = function(done) {
  return getData()
    .orderBy('Name')
    .then(res => {
      return done(null, res || []);
    })
    .catch((err) => {
      return done(err);
    });
};

exports.new = function(menuItem, done) {
  return getData()
    .insert(menuItem)
    .returning('Id')
    .then(res => {
      return done(null, res);
    }).catch((err) => {
      return done(err);
    });
};

exports.save = function(menuItem, done) {
  return getData()
    .where({
      Id: menuItem.Id
    })
    .update(menuItem)
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

exports.delete = function(id, done) {
  return getData()
    .where({
      Id: id
    })
    .delete()
    .then(() => {
      return done();
    })
    .catch((err) => {
      return done(err);
    });
};

// private
function getData() {
    return knex(tablename);
  }