# delilah-resto

Para inicializar el servidor:

``git clone https://github.com/ivancanga/delilah-resto.git``

``npm install``

``cd server``

``nodemon server``


Para inicializar la DB: 

1) Antes de comenzar es necesario servidor apache y PhpMyAdmin corriendo (XAMPP) con una entidad llamada ``delilah-resto``, el usuario por defecto de la bd tiene que ser ``root`` sin password.

2) Copiar las queries del archivo llamado **queries.txt**, ir a la pestaña SQL y correrlas. Esto crea todas las tablas, relaciones y añade registros base.


## A tener en cuenta:



## Checkout de aprobación:

1. Poder registrar un nuevo usuario:

    Dirigirse a postman, y realizar un `post` request al endpoint `http://127.0.0.1:3000/register` con el siguiente modelo de body:

    `{
	"username": "marazul",
	"name": "Mara Zul",
	"email": "marazul@outlook.com",
	"phone": 1150302030,
	"address": "Calle Falsa 123",
	"password": "asd123",
	"admin": 0
}`

    El servidor responderá 200 con un mensaje de registro exitoso.

---

2. Un usuario debe poder listar todos los productos
disponibles:

    Para listar todos los productos disponibles es necesario estar logueado, de lo contrario el servidor responderá con 401 (Unauthorized).

    Se puede usar la cuenta creada en el check anterior o usar una de cliente por defecto.

    `{
	"user": "cliente",
	"password": "asd123"
}`

    El servidor responderá un 200 con un **token**, copiar este token porque será necesario enviarlo como Header en los próximos requests. 

    En postman realizar un `get` request al endpoint `http://127.0.0.1:3000/products` con el Header: 

    `Authorization: Bearer **token copiado**`

    El servidor devolverá 200 y el listado de platos con su respectiva información.

    **En caso de no estar logueado, no ingresar token o token incorrecto, el servidor informará lo sucedido.**

---

3. Un usuario debe poder generar un nuevo pedido al
Restaurante con un listado de platos que desea:

    Con el token copiado y colocado en el header, realizar un `post` request al endpoint `http://127.0.0.1:3000/products` con el siguiente modelo de body:

    `{
	"id_product": 2,
	"qty": 10,
	"paid": 1
}`
    
    Donde `id_product` será el id del producto de la órden, podes probar con ids 1 o 2 que son los productos preseteados, `qty` será la cantidad de ese producto y `paid` será un booleano si pagó o no.

    En caso que todo esté ok, el servidor responderá con 200 y un mensaje de pedido registrado.
    
     




