# Crear imagen del BFF
docker build -t sl-bff .

# Correr BFF
docker run -d `
--name bff `
--network smartlogix-net `
-p 8080:8080 `
sl-bff