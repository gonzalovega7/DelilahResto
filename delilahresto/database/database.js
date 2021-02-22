// ------------------------------------------------------------------------------ //
//     File:       database.js -------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //


const { db } = require('./keys');
const Sequelize = require('sequelize');
const connection = `mysql://${db.user}:${db.password}@${db.host}:3306/${db.database}`;

function sql(query, ...params) {
	return sequelize
		.query(query, {
			replacements: [...params],
			type: sequelize.QueryTypes.SELECT,
		})
		.catch((e) => console.log({ e, Query: e.sql, Message: e.message }));
}

const sequelize = new Sequelize(`${process.env.SQL_URI || connection}`, {
	logging: false,
});

sequelize
	.authenticate()
	.then(() => console.log('Conexión establecida.'))
	.catch((err) => console.log('Error:', err.message));

module.exports = { sequelize, sql };
