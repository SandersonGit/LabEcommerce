-- Active: 1681867610617@@127.0.0.1@3306
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO users (id, name, email, password)
VALUES
("001", "Sanderson", "sanderson@gmail.com", "@Sl123456789"),
("002", "Melanie", "melanie@gmail.com", "@Mc987456321");

DROP TABLE users;

CREATE TABLE products (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL
);

INSERT INTO products (id, name, price, description, image_url)
VALUES
("p001", "teclado Xf1", 100.00, "Teclado mecanico", "http://magicateclado.com.br"),
("p002", "Mouse HyperFury", 250.00, "Mause óptico", "https://dreamvision.com.br");

DROP TABLE products;

CREATE TABLE purchases (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    buyer TEXT NOT NULL, 
    total_price REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime()),
    paid INTEGER NOT NULL DEFAULT (0),
    FOREIGN KEY (buyer) REFERENCES users(id)
);

INSERT INTO purchases (id, buyer, total_price)
VALUES
("a001", "001", 100.00),
("a002", "002", 250.00);

DROP TABLE purchases;

CREATE TABLE purchases_products (
    purchase_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

DROP TABLE purchases_products;

INSERT INTO purchases_products (purchase_id, product_id, quantity)
VALUES
("a001", "p001", 1),
("a002", "p002", 1);
