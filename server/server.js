const express = require("express");
const server = express();

const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken");
const signature = "39486747";

const cors = require("cors");

const Sequelize = require("sequelize");
const sequelize = new Sequelize("mysql://root@localhost:3306/delilah-resto");

server.listen(3000, () => {
  console.log("Servidor iniciado");
});

server.use(bodyParser.json(), cors());

// AUTH-AUTH ADMIN & TOKEN

function auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const validData = jwt.verify(token, signature);
    console.log(validData);
    if (validData) {
      req.userData = validData.userData;
      next();
    }
  } catch (err) {
    res.status(401).json("Error al validar usuario. Prueba un token válido.");
  }
}

function authAdmin(req, res, next) {
  if (req.userData.isAdmin) {
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
  res.status(200).json(getToken({ userData }));
});

function userLogin(req, res, next) {
  const { user, password } = req.body;
  sequelize
    .query(
      "SELECT id,username,admin FROM users WHERE username = ? AND password = ?",
      {
        replacements: [user, password],
        type: sequelize.QueryTypes.SELECT
      }
    )
    .then(result => {
      if (result.length != 0) {
        const userData = {
          id: result[0].id,
          username: result[0].username,
          isAdmin: result[0].admin
        };
        req.userData = userData;
        next();
      } else {
        res.status(400).json("Credenciales incorrectas.");
      }
    });
}

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

server.post("/products", auth, authAdmin, setProduct, (req, res) => {
  res.json("Producto agregado a la base de datos.");
});

server.put("/products/:id", auth, authAdmin, async (req, res) => {
  let productFound = await getProduct(req.params.id);
  if (productFound) {
    const { item, photo, description, price } = req.body;
    const filteredProps = filterProps({ item, photo, description, price });
    productFound = { ...productFound, ...filteredProps };

    sequelize
      .query(
        "UPDATE `products` SET `item` = ?, `description` = ?, `photo` = ?, `price` = ? WHERE `products`.`id` = ?",
        {
          replacements: [
            productFound.item,
            productFound.description,
            productFound.photo,
            productFound.price,
            req.params.id
          ],
          type: sequelize.QueryTypes.UPDATE
        }
      )
      .then(() => {
        res.json(`El producto ${req.params.id} ha sido modificado con éxito.`);
      });
  }else{
    res.status(400).json("No encontré un producto con ese ID.");
  }
});

async function getProduct(id) {
  let [
    response
  ] = await sequelize.query(
    "SELECT * from `products` WHERE `products`.`id` = ?",
    { replacements: [id] }
  );
  return response[0];
}

function filterProps(inputObject) {
  Object.keys(inputObject).forEach(
    key => !inputObject[key] && delete inputObject[key]
  );
  return inputObject;
}

server.delete("/products/:id", auth, authAdmin, deleteProduct, (req, res) => {
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
  console.log(Object.entries(req.body));
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

server.post("/orders", auth, setOrder, (req, res) => {
  res.json("Pedido registrado");
});

server.get("/orders", auth, authAdmin, getOrders, getProducts, (req, res) => {
  const { orderData } = req;
  res.status(200).json(orderData);
});

server.put("/orders/:id", auth, authAdmin, (req, res) => {
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
  const { id_product, qty, paid } = req.body;
  sequelize
    .query("INSERT INTO orders (id_user,id_state,paid) VALUES (?,?,?)", {
      replacements: [req.userData.id, 1, paid],
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
