
exports.up = function(knex, Promise) {
  return knex.raw('SELECT table_name FROM information_schema.tables WHERE table_schema = ?', [knex.client.database()])
    .then(function(tablas) {
       let sql="";
       tablas=tablas[0];
       for(let i=0; i<tablas.length; i++) {
	 sql+="ALTER TABLE "+tablas[i].table_name+" CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;";
       }
       //console.log(sql);
       return knex.raw(sql);
    });
};

exports.down = function(knex, Promise) {
  
};
