# Levantar Base de datos
docker run -d `
--name slbd-inventario `
--network smartlogix-net `
-e MYSQL_ROOT_PASSWORD=root `
-e MYSQL_DATABASE=smartlogix_inventario `
-p 3309:3306 `
-v inventario_data:/var/lib/mysql `
mysql:8

# Levantar Zookeper (debería funcionar con el de Pedidos, este solo debe ejecutarse en caso de que el Zookeeper de Pedidos no funcione con este)
docker run -d `
--name inventario-zookeeper `
--network smartlogix-net `
-e ZOOKEEPER_CLIENT_PORT=2181 `
-p 2182:2181 `
confluentinc/cp-zookeeper:7.4.0

# Levantar Kafka (lo mismo que Zookeper)
docker run -d `
--name inventario-kafka `
--network smartlogix-net `
-p 9094:9092 `
-e KAFKA_BROKER_ID=2 `
-e KAFKA_ZOOKEEPER_CONNECT=inventario-zookeeper:2181 `
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9094 `
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
confluentinc/cp-kafka:7.4.0

# Levantar PhpMyAdmin
docker run -d `
--name phpmyadmin-inventario `
--network smartlogix-net `
-e PMA_HOST=slbd-inventario `
-p 9083:80 `
phpmyadmin/phpmyadmin

# Crear Imagen de micro
docker build -t "sl-inventario" .

# Levantar Micro
docker run -d `
--name inventario `
--network smartlogix-net `
-p 8083:8083 `
sl-inventario