/* ------------------------------------------------------------------------------ */
/*    File:       database.sql  ------------------------------------------------- */
/*    Author:     Gonzalo Vega -------------------------------------------------- */
/*    Purpose:    Create DB ----------------------------------------------------- */
/* ------------------------------------------------------------------------------ */


CREATE DATABASE delilah_resto;
USE delilah_resto;

CREATE TABLE users(
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	fullname VARCHAR(100) NOT NULL,
	email VARCHAR(50) NOT NULL UNIQUE,
	mobile VARCHAR(25) NOT NULL UNIQUE,
	address VARCHAR(50) NOT NULL,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	is_admin TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY(id)
) AUTO_INCREMENT = 1000;

CREATE TABLE products(
	id INT NOT NULL AUTO_INCREMENT,
	description VARCHAR(50) NOT NULL,
	picture VARCHAR(255) NOT NULL,
	price DECIMAL(6,2) NOT NULL,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	PRIMARY KEY(id)
) AUTO_INCREMENT = 100;

CREATE TABLE payment(
	id INT NOT NULL AUTO_INCREMENT,
	method VARCHAR(25) NOT NULL,
	PRIMARY KEY(id)
) AUTO_INCREMENT = 10;

CREATE TABLE status(
	id INT NOT NULL AUTO_INCREMENT,
	status VARCHAR(25) NOT NULL,
	PRIMARY KEY(id)
) AUTO_INCREMENT = 50;

CREATE TABLE orders(
	id INT NOT NULL AUTO_INCREMENT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	is_deleted TINYINT NOT NULL DEFAULT 0,
	payment_id INT NOT NULL,
	status_id INT NOT NULL,
  total INT NOT NULL,
	user_id INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(payment_id) REFERENCES payment(id),
	FOREIGN KEY(status_id) REFERENCES status(id)
) AUTO_INCREMENT = 10000;

CREATE TABLE order_details(
	id INT NOT NULL AUTO_INCREMENT,
	order_id INT NOT NULL,
	product_id INT NOT NULL,
	quantity INT NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY(order_id) REFERENCES orders(id),
	FOREIGN KEY(product_id) REFERENCES products(id)
) AUTO_INCREMENT = 50000;

CREATE TABLE favorites(
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT,
	product_id INT,
	PRIMARY KEY(id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(product_id) REFERENCES products(id)
);

INSERT INTO status (status)
VALUES ('new'), ('confirmed'), ('preparing'), ('delivering'), ('canceled'), ('delivered');

INSERT INTO payment (method)
VALUES ('cash'), ('debit'), ('credit'), ('paypal'), ('mercadopago');

INSERT INTO products (description,picture,price,is_deleted)
VALUES
('Bagel de salmón','/img/salmonBagel.jpg',425.00,0),
('Hamburguesa clásica','/img/classicBurger.jpg',350.00,0),
('Sandwich veggie','/img/veggieSandwich.jpg',310.00,0),
('Ensalada veggie','/img/veggieSalad.jpg',340.00,0),
('Veggie avocado','/img/veggieAvocado.jpg',310.00,0),
('Focaccia BLT','/img/focacciaVLT.jpg',280.00,0),
('Sandwich de queso','/img/cheeseSandwich.jpg',268.00,0),
('Hamburguesa especial','/img/specialBurger.jpg',410.00,0);

INSERT INTO users (username, password, fullname, email, mobile, address, is_admin)
VALUES ('admin', 'admin', 'Root Admin', 'admin@delilah.com', '3419999999', 'Argentina', 1),
	('user', 'user', 'New User', 'user@email.com', '341111222333', 'Colombia', 0);