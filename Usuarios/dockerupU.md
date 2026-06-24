# Levantar Base de datos:
docker run -d `
--name slbd-usuarios `
--network smartlogix-net `
-e MYSQL_ROOT_PASSWORD=12345 `
-e MYSQL_DATABASE=smartlogix_usuarios `
-p 3306:3306 `
-v usuarios_data:/var/lib/mysql `
mysql:8

# Levantar PhpMyAdmin

docker run -d `
--name phpmyadmin-usuarios `
--network smartlogix-net `
-e PMA_HOST=slbd-usuarios `
-p 9091:80 `
phpmyadmin/phpmyadmin

# Crear imagen de micro

 docker build -t "sl-usuarios" .

# Correr imagen de micro

docker run -d --name usuarios `
 --network smartlogix-net `
 -p 8081:8081 `
 sl-usuarios