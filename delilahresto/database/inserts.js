// ------------------------------------------------------------------------------ //
//     File:       inserts.js---------------------------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //


const faker = require('faker');
const { sequelize } = require('./database');

faker.locale = 'es_MX';

let inserts = [];

//? INSERT USERS RND
for (let i = 0; i < 51; i++) {
	let user = {
		username: faker.internet.userName(),
		password: faker.internet.password(),
		fullname: faker.name.findName(),
		email: faker.internet.email(),
		mobile: faker.phone.phoneNumber(),
		address: faker.address.streetAddress(),
	};
	inserts.push(
		sequelize.query(
			`INSERT INTO users (username, password, fullname, email, mobile, address)
			VALUES (:username, :password, :fullname, :email, :mobile, :address)`,
			{ replacements: user }
		)
	);
}

//? INSERT ORDERS RND
// for (let i = 0; i < 16; i++) {
// 	let order = {
// 		payment_id: faker.random.number({ min: 10, max: 14 }),
// 		status_id: faker.random.number({ min: 50, max: 54 }),
// 		user_id: faker.random.number({ min: 1000, max: 1050 }),
// 		items: [
// 			{
// 				product_id: faker.random.number({ min: 100, max: 110 }),
// 				quantity: faker.random.number({ min: 1, max: 3 }),
// 			},
// 			{
// 				product_id: faker.random.number({ min: 100, max: 110 }),
// 				quantity: faker.random.number({ min: 1, max: 3 }),
// 			},
// 		],
// 	};
// 	inserts.push(
// 		sequelize
// 			.query(
// 				`INSERT INTO orders (payment_id, status_id, user_id) VALUES (${order.payment_id}, ${order.status_id}, ${order.user_id})`
// 			)
// 			.then((index) => {
// 				order.items.forEach((item) => {
// 					sequelize.query(
// 						`INSERT INTO order_details (order_id, product_id, quantity) VALUES(${index[0]}, ${item.product_id}, ${item.quantity})`
// 					);
// 				});
// 			})
// 	);
// }

Promise.all(inserts)
	.then((data) => console.log(data))
	.catch((e) => console.log(e));
