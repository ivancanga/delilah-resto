-- CREAR TABLAS

CREATE TABLE `delilah-resto`.`users` ( `id` INT NOT NULL AUTO_INCREMENT , `username` VARCHAR(20) NOT NULL , `name` VARCHAR(50) NOT NULL , `email` VARCHAR(40) NOT NULL , `phone` INT NULL DEFAULT NULL , `address` VARCHAR(50) NOT NULL , `password` VARCHAR(20) NOT NULL DEFAULT '0' , `admin` BOOLEAN NULL DEFAULT FALSE , PRIMARY KEY (`id`)) ENGINE = InnoDB;

CREATE TABLE `delilah-resto`.`products` ( `id` INT NOT NULL AUTO_INCREMENT , `item` VARCHAR(60) NOT NULL , `photo` VARCHAR(255) NULL DEFAULT 'https://748073e22e8db794416a-cc51ef6b37841580002827d4d94d19b6.ssl.cf3.rackcdn.com/not-found.png ' , `description` TEXT NOT NULL , `price` INT NOT NULL , `drop_date` DATE NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

CREATE TABLE `delilah-resto`.`orders` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user` INT NOT NULL , `id_state` INT NOT NULL , `date` INT NOT NULL DEFAULT CURRENT_TIMESTAMP , `paid` BOOLEAN NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

CREATE TABLE `delilah-resto`.`order_products` ( `id_order` INT NOT NULL , `id_product` INT NOT NULL , `qty` INT NOT NULL ) ENGINE = InnoDB;

CREATE TABLE `delilah-resto`.`states` ( `id` INT NOT NULL , `description` VARCHAR(20) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;


-- CREAR RELACIONES

ALTER TABLE `orders` ADD FOREIGN KEY (`id_user`) REFERENCES `delilah-resto`.`users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT; ALTER TABLE `orders` ADD FOREIGN KEY (`id_state`) REFERENCES `delilah-resto`.`states`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `order_products` ADD FOREIGN KEY (`id_order`) REFERENCES `delilah-resto`.`orders`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT; ALTER TABLE `order_products` ADD FOREIGN KEY (`id_product`) REFERENCES `delilah-resto`.`products`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- INSERTS

INSERT INTO `states` (`id`, `description`) VALUES ('1', 'NUEVO'), ('2', 'CONFIRMADO'), ('3', 'PREPARANDO'), ('4', 'ENVIADO'), ('5', 'CANCELADO'), ('6', 'ENTREGADO');

INSERT INTO `products` (`id`, `item`, `photo`, `description`, `price`, `drop_date`) VALUES (NULL, 'Hamburguesa con queso', 'https://748073e22e8db794416a-cc51ef6b37841580002827d4d94d19b6.ssl.cf3.rackcdn.com/not-found.png ', 'Hamburguesa de carne vacuna condimentada con salsa ketchup y cebolla, con el mejor cheddar de la ciudad.', '199', NULL), (NULL, 'Pizza napolitana', 'https://748073e22e8db794416a-cc51ef6b37841580002827d4d94d19b6.ssl.cf3.rackcdn.com/not-found.png ', 'La mejor pizza con tomates frescos de la huerta y muzzarella bien caliente.', '449', NULL);

INSERT INTO `users` (`id`, `username`, `name`, `email`, `phone`, `address`, `password`, `admin`) VALUES (NULL, 'admin', 'Administrador ', 'admin@delilah-resto.com', '1120204040', 'Calle Falsa 123', 'asd123', '1'), (NULL, 'cliente', 'Cliente', 'cliente@cliente.com', '11002030', 'Calle Falsa 123', 'asd123', '0');