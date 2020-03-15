const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const signature = "39486747";
const cors = require("cors");
const mysql = require("mysql");
const server = express();
const Sequelize = require("sequelize");
const sequelize = new Sequelize("mysql://root@localhost:3306/delilah-resto");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "delilah-resto"
});

connection.connect(function(error) {
  if (error) {
    throw error;
  } else {
    console.log("Conexion correcta.");
  }
});

server.listen(3000, () => {
  console.log("Servidor iniciado");
});

server.use(bodyParser.json(), cors());

server.post("/login", userLogin, (req, res) => {
  const { userData } = req;
  console.log(userData);
  // const isAdmin = userData[0].admin;
  // const token = getToken({ userData });
  // const activeUser = { token, isAdmin };
  res.status(200).json(userData);
});

server.post("/register", (req, res) => {
  const { username, name, email, phone, address, password, admin } = req.body;
  let insert = `INSERT INTO users(username,name,email,phone,address,password,admin)
    VALUES ('${username}','${name}','${email}',${phone},'${address}','${password}',${admin})`;
  connection.query(insert);
  res.json("Usuario agregado a la base de datos");
});

server.post("/products", (req, res) => {
  const { name, photo, description, price } = req.body;
  let insert = `INSERT INTO menu(name,photo,description,price)
    VALUES ('${name}','${photo}','${description}',${price})`;
  connection.query(insert);
  res.json("Plato agregado a la base de datos");
});

server.get("/products", (req, res) => {
  connection.query("SELECT * FROM menu", (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// Muestra todos los items del menu
connection.query("SELECT * FROM products", function(error, results, fields) {
  if (error) throw error;
  results.forEach(result => {
    console.log(result);
  });
});

// function userLogin(req, res, next) {
//   const { user, password } = req.body;
//   connection.query(
//     `SELECT id,name,email,phone,address,admin FROM users
//      WHERE username = '${user}' AND password = '${password}' `,
//     (error, userData, fields) => {
//       if (error) throw error;
//       if (userData.length !== 0) {
//         req.userData = userData;
//         next();
//       } else {
//         res.status(400).json("Credenciales incorrectas.");
//       }
//     }
//   );
// }

function userLogin(req, res, next) {
  const { user, password } = req.body;
  sequelize
    .query(
      "SELECT id,name,email,phone,address,admin FROM users WHERE username = ? AND password = ?",
      {
        replacements: [user, password],
        type: sequelize.QueryTypes.SELECT
      }
    )
    .then(results => {
      console.log(results);
      if (results.length !== 0) {
        req.userData = results[0];
        next();
      } else {
        res.status(400).json("Credenciales incorrectas.");
      }
    });
}

function getToken(data) {
  const resp = jwt.sign(data, signature);
  return resp;
}

// ORDENES

server.get("/orders", getOrders, getProducts, (req, res) => {
  const { orderData } = req;
  console.log("Paso al request, ", orderData);
  res.status(200).json(orderData);
});

function getOrders(req, res, next) {
  sequelize
    .query(
      "SELECT orders.id, states.description as estado, orders.date as fecha, orders.paid as pago, users.name as usuario, users.address as direccion FROM orders INNER JOIN `users` ON `orders`.`id_user` = `users`.`id` INNER JOIN `states` ON `orders`.`id_state` = `states`.`id`",
      {
        type: sequelize.QueryTypes.SELECT
      }
    )
    .then(results => {
      console.log(results);
      if (results.length !== 0) {
        req.orderData = results;
        next();
      } else {
        res.status(400).json("No hay pedidos para mostrar.");
      }
    });
}

function getProducts(req, res, next) {
  let promises = [];
  req.orderData.forEach(order => {
    promises.push(
      sequelize
        .query(
          "SELECT products.item, products.price, order_products.qty FROM `order_products` INNER JOIN `products` ON products.id = order_products.id_product WHERE id_order = ?",
          { replacements: [order.id], type: sequelize.QueryTypes.SELECT }
        )
        .then(results => {
          order.productos = results;
          order.total = order.productos
            .map(producto => producto.price)
            .reduce((acc, cur) => acc + cur);
        })
    );
  });
  Promise.all(promises).then(() => {
    req.orderData = req.orderData;
    next();
  }).catch(err => {
    console.log(err);
  });;
}
