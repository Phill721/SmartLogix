# Etapa 1: build
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copiar primero el POM para aprovechar caché de dependencias
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Copiar el código y compilar
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=builder /app/target/servicio-pedidos-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
