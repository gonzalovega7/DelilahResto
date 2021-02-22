// ------------------------------------------------------------------------------ //
//     File:       products.js -------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //


const express = require('express');
const { sequelize } = require('../database/database');
const Router = express.Router();
const { isAdmin, isLogged } = require('../lib/helpers');

// ROUTES / PRODUCTS

Router.get('/products', isLogged, async (_req, res) => {
	try {
		const query =
			'SELECT id, description, picture, price FROM products WHERE is_deleted = 0';
		const answer = await sequelize.query(query);
		res.send(answer[0]);
	} catch {
		res.sendStatus(500);
	}
});

Router.post('/products', isAdmin, async (req, res) => {
	try {
		let answer;
		let { description, picture, price } = req.body;
		if (!description || !picture || !price) return res.sendStatus(400);
		let query = `INSERT INTO products (description, picture, price) VALUES("${description}", "${picture}", "${price}");`;
		[answer] = await sequelize.query(query);
		query = `SELECT id, description, picture, price FROM products WHERE id = ${answer}`;
		answer = await sequelize.query(query);
		res.status(201).json(answer[0]);
	} catch {
		res.status(500);
	}
});

Router.get('/products/:id', isLogged, async (req, res) => {
	try {
		let { id } = req.params;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id)) return res.sendStatus(400);
		const query = `SELECT description, picture, price FROM products WHERE id = ${id} AND is_deleted = 0`;
		const answer = await sequelize.query(query);
		if (!answer[0][0]) return res.sendStatus(404);
		res.send(answer[0]);
	} catch (e) {
		res.status(500);
	}
});

Router.put('/products/:id', isAdmin, async (req, res) => {
	try {
		let { id } = req.params;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id)) return res.sendStatus(400);
		let { description, picture, price } = req.body;
		if (!description || !picture || !price) return res.sendStatus(400);
		let query = `SELECT * FROM products WHERE id = ${id}`;
		let answer = await sequelize.query(query);
		if (!answer[0][0]) return res.sendStatus(404);
		query = `UPDATE products SET description = "${description}",	picture = "${picture}",	price = "${price}" WHERE id = "${id}"`;
		[answer] = await sequelize.query(query);
		if (!answer.changedRows)
			return res.status(409).send([{ err: 'Nothing changed.' }]);
		query = `SELECT description, picture, price FROM products WHERE id = ${id} AND is_deleted = 0`;
		answer = await sequelize.query(query);
		res.send(answer[0]);
	} catch {
		res.status(500);
	}
});

Router.delete('/products/:id', isAdmin, async (req, res) => {
	try {
		let { id } = req.params;
		let regex = new RegExp('^[0-9]+$');
		if (!regex.test(id)) return res.sendStatus(400);
		let query = `SELECT is_deleted FROM products WHERE id = ${id} AND is_deleted = 0`;
		let answer = await sequelize.query(query);
		if (!answer[0][0]) return res.sendStatus(404);
		query = `UPDATE products SET is_deleted = 1 WHERE id = ${id}`;
		await sequelize.query(query);
		res.sendStatus(204);
	} catch {
		res.status(500);
	}
});

module.exports = Router;
