// ------------------------------------------------------------------------------ //
//     File:       helpers.js --------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //


const { sequelize } = require('../database/database');
const { privateKey } = require('../private.key');
const User = require("../models/User.model");
const jwt = require('jsonwebtoken');

function isAdmin(req, res, next) {
	try {
		if (!req.headers.authorization) return res.sendStatus(401);
		let token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, privateKey, (err, data) => {
			if (err) return res.status(400).send([{ err: err.message }]);
			if (!data.is_admin) return res.sendStatus(401);
			next();
		});
	} catch (e) {
		console.log(e);
	}
}

function isLogged(req, res, next) {
	try {
		if (!req.headers.authorization) return res.sendStatus(401);
		let token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, privateKey, async (err, data) => {
			if (err) return res.status(400).send([{ err: err.message }]);
      let query = `SELECT username FROM users WHERE id = "${data.id}"`;
      let answer = await sequelize.query(query);
			if (!answer[0][0]) return res.sendStatus(401);
			next();
		});
	} catch (e) {
    console.log(e);
  }
}

function isAccesingOwnData(req, res, next) {
	try {
		if (!req.params.username) return res.sendStatus(400);
		let token = req.headers.authorization.split(' ')[1];
		jwt.verify(token, privateKey, async (err, data) => {
			if (err) return res.status(400).send([{ err: err.message }]);
			if (req.params.username !== data.username)
				return res.sendStatus(401);
			next();
		});
	} catch (e) {
		console.log(e);
	}
}

const CheckDuplicateEmail = async (req, res, next) => {
	const email = await User.findOne({ where: { email: req.body.email } });
	if (email) {
	  return res.status(400).json({ message: "The email already exists" });
	}
	next();
};

  

module.exports = { isAdmin, isLogged, isAccesingOwnData, CheckDuplicateEmail };
