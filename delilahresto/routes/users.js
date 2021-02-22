// ------------------------------------------------------------------------------ //
//     File:       users.js ----------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //

const express = require('express');
const { sql, sequelize } = require('../database/database');
const jwt = require('jsonwebtoken');
const Router = express.Router();
const { privateKey } = require('../private.key');
const CheckDuplicateEmail = require("../middlewares/verify.middleware");
const { isAdmin, isLogged, isAccesingOwnData } = require('../lib/helpers');


router.post("/signup", CheckDuplicateEmail, (req, res) => {
  signUp(req.body)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(error.status).json(error.message);
    });
});

Router.post('/users', async (req, res) => {
	let query, user, payload;
	try {
		let { username, fullname, email, mobile, address, password } = req.body;
		if (
			!username ||
			!fullname ||
			!email ||
			!mobile ||
			!address ||
			!password
		)
			return res.sendStatus(400);
		query = `SELECT username, email, mobile FROM users WHERE is_deleted = 0 && (email = "${email}" || mobile = "${mobile}" || username = "${username}")`;
		let answer = await sequelize.query(query);
		if (answer[0][0])
			return res
				.status(409)
				.send([{ err: 'Email, username or mobile already used.' }]);
		query = `INSERT INTO users (username, fullname, email, mobile, address, password) VALUES("${username}", "${fullname}", "${email}", "${mobile}", "${address}", "${password}");`;
		answer = await sequelize.query(query);
		let userId = answer[0];
		query = `SELECT username, fullname, email, mobile, address, is_admin FROM users WHERE id = "${answer[0]}"`;
		answer = await sequelize.query(query);
		user = answer[0][0];
		payload = {
			id: userId,
			username: username,
			is_admin: user.is_admin,
		};
		const token = jwt.sign(payload, privateKey);
		res.set('Authorization', `Bearer ${token}`);
		res.status(201).json(answer[0]);
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

Router.get('/users', isAdmin, async (_req, res) => {
	try {
		const query =
			'SELECT id, username, fullname, email, mobile, address FROM users WHERE is_deleted = 0';
		const answer = await sequelize.query(query);
		res.status(200).send(answer[0]);
	} catch {
		res.sendStatus(500);
	}
});

Router.get(
	'/users/:username',
	isLogged,
	isAccesingOwnData,
	async (req, res) => {
		try {
			let { username } = req.params;
			let regex = new RegExp('^[\\w]+$');
			if (!regex.test(username)) return res.sendStatus(400);
			const answer = await sql(
				'SELECT id, username, fullname, email, mobile, address FROM users WHERE username = ? AND is_deleted = 0',
				username
			);
			res.send(answer);
		} catch {
			res.sendStatus(500);
		}
	}
);

Router.put(
	'/users/:username',
	isLogged,
	isAccesingOwnData,
	async (req, res) => {
		try {
			let paramUsername = req.params.username;
			let regex = new RegExp('^[\\w]+$');
			if (!regex.test(paramUsername)) return res.sendStatus(400);
			let {
				username,
				fullname,
				email,
				mobile,
				address,
				password,
			} = req.body;
			if (
				!username ||
				!fullname ||
				!email ||
				!mobile ||
				!address ||
				!password
			)
				return res.sendStatus(400);
			let query = `SELECT * FROM users WHERE username = "${paramUsername}" AND is_deleted = 0`;
			let answer = await sequelize.query(query);
			if (!answer[0][0]) return res.sendStatus(404);
			query = `UPDATE users SET username = "${username}",	fullname = "${fullname}",	email = "${email}", mobile = "${mobile}", address = "${address}", password = "${password}"  WHERE username = "${paramUsername}"`;
			[answer] = await sequelize.query(query);
			if (!answer.changedRows)
				return res.status(409).send([{ err: 'Nothing changed.' }]);
			query = `SELECT * FROM users WHERE username = "${paramUsername}"`;
			answer = await sequelize.query(query);
			res.send(answer[0]);
		} catch {
			res.sendStatus(500);
		}
	}
);

Router.get(
	'/users/:username/favorites',
	isLogged,
	isAccesingOwnData,
	async (req, res) => {
		try {
			let paramUsername = req.params.username;
			let regex = new RegExp('^[\\w]+$');
			if (!regex.test(paramUsername)) return res.sendStatus(400);
			let response;
			await sequelize
				.query(
					'SELECT id FROM users WHERE username = ? AND is_deleted = 0',
					{
						replacements: [paramUsername],
						type: sequelize.QueryTypes.SELECT,
					}
				)
				.then((data) => (response = data[0]))
				.catch((e) =>
					console.log({ e, Query: e.sql, Message: e.message })
				);

			await sequelize
				.query('SELECT product_id FROM favorites WHERE user_id = ?', {
					replacements: [response.id],
					type: sequelize.QueryTypes.SELECT,
				})
				.then((data) => (response = data))
				.catch((e) =>
					console.log({ e, Query: e.sql, Message: e.message })
				);

			let send = [];

			response.forEach((prod) => {
				send.push(
					sequelize
						.query(
							'SELECT description, picture, price FROM products WHERE id = ?',
							{
								replacements: [prod.product_id],
								type: sequelize.QueryTypes.SELECT,
							}
						)
						.then((res) => res[0])
				);
			});

			Promise.all(send).then((data) => {
				res.send(data);
			});
		} catch {
			res.sendStatus(500);
		}
	}
);

Router.delete('/users/:id', isAdmin, async (req, res) => {
	try {
		let { id } = req.params;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id)) return res.sendStatus(400);
		let query = `SELECT * FROM users WHERE id = ${id} AND is_deleted = 0`;
		let answer = await sequelize.query(query);
		if (!answer[0][0]) return res.sendStatus(404);
		query = `UPDATE users SET is_deleted = 1 WHERE id = ${id}`;
		await sequelize.query(query);
		res.sendStatus(204);
	} catch {
		res.sendStatus(500);
	}
});

Router.post('/signin', async (req, res) => {
	let query, user, payload;
	let { username, email, password } = req.body;
	if ((!username || !email) && !password) return res.sendStatus(400);
	if (username)
		query = `SELECT id, is_admin, fullname, address FROM users WHERE username = "${username}" AND password = "${password}" AND is_deleted = 0`;
	else
		query = `SELECT id, is_admin, fullname, address FROM users WHERE email = "${email}" AND password = "${password}" AND is_deleted = 0`;
	const answer = await sequelize.query(query);
	if (!answer[0][0])
		return res.status(401).send([{ err: 'Invalid credentials.' }]);
	user = answer[0][0];
	payload = {
		id: user.id,
		username: username,
		is_admin: user.is_admin,
	};
	const token = jwt.sign(payload, privateKey);
	res.set('Authorization', `Bearer ${token}`);
	res.send([
		{ fullname: user.fullname, username: username, address: user.address },
	]);
});

module.exports = Router;
