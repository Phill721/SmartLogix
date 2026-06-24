# Levantar Base de datos:
docker run -d `
--name slbd-pedidos `
--network smartlogix-net `
-e MYSQL_ROOT_PASSWORD=12345 `
-e MYSQL_DATABASE=smartlogix_pedidos `
-p 3308:3306 `
-v pedidos_data:/var/lib/mysql `
mysql:8

# Levantar Zookeeper
docker run -d `
--name zookeeper `
--network smartlogix-net `
-e ZOOKEEPER_CLIENT_PORT=2181 `
-p 2181:2181 `
confluentinc/cp-zookeeper:7.4.0

# Levantar Kafka
docker run -d `
--name kafka `
--network smartlogix-net `
-p 9093:9092 `
-p 29092:29092 `
-e KAFKA_BROKER_ID=1 `
-e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 `
-e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,PLAINTEXT_HOST://0.0.0.0:29092 `
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092 `
-e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT `
-e KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT `
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
confluentinc/cp-kafka:7.4.0

# Levantar PhpMyAdmin

docker run -d `
--name phpmyadmin-pedidos `
--network smartlogix-net `
-e PMA_HOST=slbd-pedidos `
-p 9087:80 `
phpmyadmin/phpmyadmin

# Crear imagen de micro

 docker build -t "sl-pedidos" .

# Correr imagen de micro

docker run -d --name pedidos `
 --network smartlogix-net `
 -p 8087:8087 `
 sl-pedidos