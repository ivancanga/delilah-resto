const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const signature = "39486747";
const cors = require("cors");
const mysql = require("mysql");
const server = express();

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
  const isAdmin = userData[0].admin;
  const token = getToken({ userData });
  const activeUser = {token,isAdmin};
  res.status(200).json(activeUser);
});

server.post("/register", (req, res) => {
  const { username, name, email, phone, address, password, admin } = req.body;
  let insert = `INSERT INTO users(username,name,email,phone,address,password,admin)
    VALUES ('${username}','${name}','${email}',${phone},'${address}','${password}',${admin})`;
  connection.query(insert);
  res.json("Usuario agregado a la base de datos");
});

server.post("/menu", (req, res) => {
  const { name, photo, description, price } = req.body;
  let insert = `INSERT INTO menu(name,photo,description,price)
    VALUES ('${name}','${photo}','${description}',${price})`;
  connection.query(insert);
  res.json("Plato agregado a la base de datos");
});

server.get("/menu", (req, res) => {
  connection.query("SELECT * FROM menu", (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// Muestra todos los items del menu
// connection.query("SELECT * FROM menu", function(error, results, fields) {
//   if (error) throw error;
//   results.forEach(result => {
//     console.log(result);
//   });
// });

function userLogin(req, res, next) {
  const { user, password } = req.body;
  connection.query(
    `SELECT id,name,email,phone,address,admin FROM users 
     WHERE username = '${user}' OR email = '${user}' AND password = '${password}' `,
    (error, userData, fields) => {
      if (error) throw error;
      if (userData.length !== 0) {
        req.userData = userData;
        next();
      } else {
        res.status(400).json("Credenciales incorrectas.");
      }
    }
  );
}

function getToken(data) {
  const resp = jwt.sign(data, signature);
  return resp;
}
