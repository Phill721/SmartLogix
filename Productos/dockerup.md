# Levantar Base de datos:
docker run -d `
--name slbd-productos `
--network smartlogix-net `
-e MYSQL_ROOT_PASSWORD=12345 `
-e MYSQL_DATABASE=smartlogix_productos `
-p 3307:3306 `
-v productos_data:/var/lib/mysql `
mysql:8

# Levantar PhpMyAdmin

docker run -d `
--name phpmyadmin-productos `
--network smartlogix-net `
-e PMA_HOST=slbd-productos `
-p 9094:80 `
phpmyadmin/phpmyadmin

# Crear imagen de micro

 docker build -t "sl-productos" .

# Correr imagen de micro

docker run -d --name productos `
 --network smartlogix-net `
 -p 8084:8084 `
 sl-productos