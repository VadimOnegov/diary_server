const tablename = 'Menu';
const knex = require('./connection');

// public
exports.data = getData();

exports.getAll = function(done) {
  return getData()
    .then(res => {
      return done(null, res || []);
    })
    .catch((err) => {
      return done(err);
    });
};

exports.save = function(menuItem, done) {
  return menuItem.id ?
      getData()
      .where({
        id: menuItem.id
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
      })
    :
      getData()
      .insert(menuItem)
      .then(res => {
        return done(null, res);
      }).catch((err) => {
        return done(err);
      });
}


// private
function getData() {
    return knex(tablename);
  }