const express = require("express");
const server = express();
const session = require("express-session");

const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");
const signature = "39486747";

const cors = require("cors");

const Sequelize = require("sequelize");
const sequelize = new Sequelize("mysql://root@localhost:3306/delilah-resto");

server.listen(3000, () => {
  console.log("Servidor iniciado");
});

server.use(
  session({
    secret: "delilah-restoAUTH",
    resave: true,
    saveUninitialized: true
  }),
  bodyParser.json(),
  cors()
);

// AUTH-AUTH ADMIN & TOKEN

function auth(req, res, next) {
  if (!req.session.user) {
    res.status(401).json("Necesitas estar logeado para acceder a esta ruta.");
  } else if (req.headers.authorization && req.session.token === req.headers.authorization.split(" ")[1]) {
    console.log("Autenticación correcta con token.");
    next();
  } else {
    res.status(401).json("Error al validar usuario.");
  }
}

function authAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res
      .status(401)
      .json(
        "Se necesitan permisos de administrador para acceder a esta ruta. Por favor, loguea un usuario administrador."
      );
  }
}

function getToken(data) {
  const resp = jwt.sign(data, signature);
  return resp;
}

// REGISTER & LOGIN/LOGOUT

server.post("/register", (req, res) => {
  const { username, name, email, phone, address, password, admin } = req.body;
  sequelize
    .query(
      "INSERT INTO users(username,name,email,phone,address,password,admin) VALUES(?,?,?,?,?,?,?)",
      {
        replacements: [username, name, email, phone, address, password, admin],
        type: sequelize.QueryTypes.INSERT
      }
    )
    .then(resp => {
      res.json("Usuario agregado a la base de datos");
    });
});

server.post("/login", userLogin, (req, res) => {
  const { userData } = req;
  req.session.token = getToken({ userData });
  console.log(req.session);
  res.status(200).json(req.session.token);
});

function userLogin(req, res, next) {
  if (!req.session.user) {
    const { user, password } = req.body;
    sequelize
      .query(
        "SELECT id,name,email,phone,address,admin FROM users WHERE username = ? AND password = ?",
        {
          replacements: [user, password],
          type: sequelize.QueryTypes.SELECT
        }
      )
      .then(result => {
        if (result.length != 0) {
          if (result[0].admin) req.session.admin = true;
          req.session.user = user;
          req.session.id_user = result[0].id;
          req.userData = result[0];
          next();
        } else {
          res.status(400).json("Credenciales incorrectas.");
        }
      });
  } else {
    res
      .status(409)
      .json(
        "Ya te encuentras logeado. Por favor deslogea o reinicia el servidor."
      );
  }
}

server.post("/logout", (req, res) => {
  req.session.destroy();
  res.json("Deslogueaste exitosamente.");
});

// PRODUCTOS

server.get("/products", auth, (req, res) => {
  sequelize
    .query("SELECT * FROM products WHERE drop_date IS NULL", {
      type: sequelize.QueryTypes.SELECT
    })
    .then(results => {
      res.json(results);
    });
});

server.post("/products", authAdmin, setProduct, (req, res) => {
  res.json("Producto agregado a la base de datos.");
});

// server.put("/products/:id", authAdmin, (req, res) => {
//   sequelize.query(
//     "SELECT item, photo, description, price FROM products WHERE `products`.`.id` = ?",
//     {
//       replacements: [req.params.id]
//     }
//   )
//   const { item, photo, description, price } = req.body;
//   sequelize.query(
//     "UPDATE `products` SET `item` = ?, `photo` = ?, `description` = ?, `price` = ? WHERE `products`.`id` = ?",
//     {
//       replacements: [item, photo, description, price, req.params.id],
//       type: sequelize.QueryTypes.INSERT
//     }
//   );
//   res.json('Producto actualizado');
// });

server.delete("/products/:id", authAdmin, deleteProduct, (req, res) => {
  res.json("Producto eliminado de la base de datos.");
});

function deleteProduct(req, res, next) {
  sequelize
    .query(
      "UPDATE `products` SET `drop_date` = CURRENT_TIMESTAMP() WHERE id = ? AND `drop_date` IS NULL",
      {
        replacements: [req.params.id]
      }
    )
    .then(() => {
      next();
    });
}

function setProduct(req, res, next) {
  const { name, photo, description, price } = req.body;
  sequelize
    .query(
      "INSERT INTO products (item,photo,description,price) VALUES (?,?,?,?)",
      {
        replacements: [name, photo, description, price],
        type: sequelize.QueryTypes.INSERT
      }
    )
    .then(() => {
      next();
    });
}

// ORDENES

server.post("/orders", setOrder, (req, res) => {
  res.json("Pedido registrado");
});

server.get("/orders", auth, authAdmin, getOrders, getProducts, (req, res) => {
  const { orderData } = req;
  res.status(200).json(orderData);
});

server.put("/orders/:id", authAdmin, (req, res) => {
  const { newStatus } = req.body;
  sequelize
    .query("UPDATE `orders` SET `id_state` = ? WHERE `orders`.`id` = ?", {
      replacements: [newStatus, req.params.id],
      type: sequelize.QueryTypes.UPDATE
    })
    .then(() => {
      res.json("El estado del pedido ha sido modificado con éxito.");
    });
});

function setOrder(req, res, next) {
  if (req.session.id_user) {
    const { id_product, qty, paid } = req.body;
    sequelize
      .query("INSERT INTO orders (id_user,id_state,paid) VALUES (?,?,?)", {
        replacements: [req.session.id_user, 1, paid],
        type: sequelize.QueryTypes.INSERT
      })
      .then(result => {
        const id_order = result[0];
        sequelize
          .query(
            "INSERT INTO order_products(id_order,id_product,qty) VALUES (?,?,?)",
            {
              replacements: [id_order, id_product, qty],
              type: sequelize.QueryTypes.INSERT
            }
          )
          .then(response => {
            console.log("Pedido registrado");
            next();
          });
      });
  } else {
    res.status(401).json("Para realizar un pedido debes estar logueado.");
  }
}

function getOrders(req, res, next) {
  sequelize
    .query(
      "SELECT orders.id, states.description as estado, orders.date as fecha, orders.paid as pago, users.name as usuario, users.address as direccion FROM orders INNER JOIN `users` ON `orders`.`id_user` = `users`.`id` INNER JOIN `states` ON `orders`.`id_state` = `states`.`id`",
      {
        type: sequelize.QueryTypes.SELECT
      }
    )
    .then(results => {
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
            .map(producto => producto.price * producto.qty)
            .reduce((acc, cur) => acc + cur);
        })
    );
  });
  Promise.all(promises)
    .then(() => {
      req.orderData = req.orderData;
      next();
    })
    .catch(err => {
      console.log(err);
    });
}
