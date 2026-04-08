# Despliegue de una Aplicacion Web Completa con Contenedores

## Descripcion

En este trabajo hice una aplicacion web sencilla de tareas.
La idea fue hacer algo basico pero funcional, para demostrar que el frontend, el backend y la base de datos si se pueden conectar usando contenedores Docker.

La aplicacion permite:

- crear tareas
- ver las tareas guardadas
- cambiar el estado de una tarea

## Tecnologias usadas

- React con Vite
- Node.js
- Express
- TypeScript
- PostgreSQL
- Nginx
- Docker

## Estructura del proyecto

La estructura del repositorio es esta:

```text
/back
/front
README.md
```

## Como esta dividido

### Front

En `front` esta la parte visual de la aplicacion.
Se hizo con React.
Cuando se construye la imagen, el frontend se sirve con Nginx.

### Back

En `back` esta el backend.
Se hizo con Express y TypeScript.
El backend expone el API y se conecta con PostgreSQL.

### Base de datos

La base de datos usada es PostgreSQL.
Se levanta con la imagen oficial y usa un volumen para guardar la informacion.

## Docker en este proyecto

Para este trabajo no use `docker-compose`, porque el PDF dice que todo debe hacerse con comandos manuales.

En Docker use:

- una imagen personalizada para el backend
- una imagen personalizada para el frontend
- dos redes Docker
- un volumen Docker

## Imagen del backend

La imagen del backend se construye con el archivo `back/Dockerfile`.

Este Dockerfile usa dos etapas:

- una etapa para instalar dependencias y compilar
- otra etapa para ejecutar la aplicacion con solo lo necesario

Comando:

```bash
docker build -t proyecto-back ./back
```

## Imagen del frontend

La imagen del frontend se construye con el archivo `front/Dockerfile`.

Tambien use dos etapas:

- una etapa para construir el frontend
- otra etapa con Nginx para servir los archivos generados

Comando:

```bash
docker build -t proyecto-front ./front
```

## Redes Docker

En este proyecto use dos redes:

- `front-back-net`
- `back-db-net`

La primera se usa para comunicar el frontend con el backend.
La segunda se usa para comunicar el backend con la base de datos.

Comandos:

```bash
docker network create front-back-net
docker network create back-db-net
```

## Volumen Docker

Para la base de datos use un volumen llamado `postgres-data`.
Eso sirve para que los datos no se pierdan facilmente si el contenedor se elimina.

Comando:

```bash
docker volume create postgres-data
```

## Levantar la base de datos

```text
docker run -d --name postgres-db --network back-db-net -e POSTGRES_DB=tasksdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -v postgres-data:/var/lib/postgresql/data postgres:17-alpine
```

## Levantar el backend

```text
docker run -d --name back-app --network back-db-net -e PORT=3000 -e DB_HOST=postgres-db -e DB_PORT=5432 -e DB_NAME=tasksdb -e DB_USER=postgres -e DB_PASSWORD=postgres proyecto-back
```

Despues de eso hay que conectarlo tambien a la red del frontend:

```bash
docker network connect front-back-net back-app
```

## Levantar el frontend

```text
docker run -d --name front-app --network front-back-net -p 8080:80 proyecto-front
```

## Como funciona

Cuando todo esta levantado, funciona asi:

- el navegador entra por `http://localhost:8080`
- Nginx sirve el frontend
- Nginx manda las peticiones `/api` al backend
- el backend consulta o guarda datos en PostgreSQL

## Comandos completos para levantar todo

```bash
docker build -t proyecto-back ./back
docker build -t proyecto-front ./front

docker network create front-back-net
docker network create back-db-net

docker volume create postgres-data

docker run -d --name postgres-db --network back-db-net -e POSTGRES_DB=tasksdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -v postgres-data:/var/lib/postgresql/data postgres:17-alpine

docker run -d --name back-app --network back-db-net -e PORT=3000 -e DB_HOST=postgres-db -e DB_PORT=5432 -e DB_NAME=tasksdb -e DB_USER=postgres -e DB_PASSWORD=postgres proyecto-back

docker network connect front-back-net back-app

docker run -d --name front-app --network front-back-net -p 8080:80 proyecto-front
```

## Puerto de la aplicacion

La aplicacion se abre en:

```text
http://localhost:8080
```

## Comandos utiles

Ver contenedores:

```bash
docker ps
```

Ver redes:

```bash
docker network ls
```

Ver volumenes:

```bash
docker volume ls
```

Ver logs del backend:

```bash
docker logs back-app
```

Ver logs del frontend:

```bash
docker logs front-app
```

## Pruebas hechas

Para revisar que la aplicacion si funcionaba, hice pruebas creando tareas sencillas como estas:

- comprar pan
- ordenar el cuarto
- lavar la loza
- sacar la basura

Con eso pude comprobar:

- que la pagina carga
- que el frontend si consume el backend
- que se pueden crear tareas
- que las tareas aparecen en pantalla
- que el estado cambia al presionar el boton
- que la informacion queda guardada en la base de datos

## Resumen

Con este proyecto se cumple lo pedido en el PDF:

- backend con framework
- frontend con framework
- frontend servido con Nginx
- Nginx como proxy inverso
- imagen personalizada para back
- imagen personalizada para front
- multi-stage build en ambas imagenes
- dos redes Docker
- volumen Docker para la base de datos
- sin usar docker-compose
