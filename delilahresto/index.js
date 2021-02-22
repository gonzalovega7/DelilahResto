// ------------------------------------------------------------------------------ //
//     File:       index.js ----------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //


if (process.env.NODE_ENV === 'production') {
	require('dotenv').config();
}

const express = require('express');
const cors = require('cors');

const app = express();
app.set('port', process.env.PORT || 3000);
app.listen(
	app.get('port'),
	console.log(`Server listening on port ${app.get('port')}`)
);

app.use(
	cors({
		origin: '*',
		methods: 'GET,PUT,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
		exposedHeaders: 'Authorization',
	})
);

app.use(express.json());

app.use((err, _req, res, next) => {
	if (err) return res.status(err.status).send([{ err: err.message }]);
	next();
});


app.use(require('./routes/users'));
app.use(require('./routes/products'));
app.use(require('./routes/orders'));

app.use(express.static(__dirname + '/public'));

app.get('/admin', (_, res) => {
	res.sendFile(__dirname + '/public/admin.html');
});
