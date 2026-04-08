# Despliegue de una Aplicacion Web Completa con Contenedores

## Descripcion del proyecto

Este proyecto es una aplicacion web sencilla para registrar tareas.
La idea fue hacer algo simple para mostrar que el frontend, el backend y la base de datos si se conectan.

- `front`: interfaz hecha con React.
- `back`: API desarrollada con Express.
- `bd`: base de datos PostgreSQL.

El frontend se sirve con Nginx y desde ahi tambien se mandan las peticiones al backend.

## Tecnologias utilizadas

- React con Vite para el frontend
- Nginx para servir el frontend
- Node.js con Express para el backend
- TypeScript en el backend
- PostgreSQL como base de datos
- Docker para crear y ejecutar los contenedores

## Estructura del repositorio

```text
/
├── back/
├── front/
└── README.md
```

## Explicacion general de Docker en este proyecto

En este trabajo no se uso `docker-compose`, porque el PDF pide hacerlo con comandos manuales.

En Docker se uso esto:

- dos imagenes personalizadas, una para el backend y otra para el frontend
- dos redes, una para frontend y backend, y otra para backend y base de datos
- un volumen, para que PostgreSQL no pierda la informacion si el contenedor se elimina

## Backend

La imagen del backend se construye desde la carpeta `back`.
Se usa un `Dockerfile` con dos etapas.

- primera etapa: instala dependencias y compila el proyecto
- segunda etapa: crea una imagen mas liviana con solo lo necesario para ejecutar

Comando:

```bash
docker build -t proyecto-back ./back
```

## Frontend

La imagen del frontend se construye desde la carpeta `front`.
Tambien usa dos etapas:

- primera etapa: instala dependencias y genera la carpeta `dist`
- segunda etapa: usa Nginx para servir los archivos ya compilados

Comando:

```bash
docker build -t proyecto-front ./front
```

## Redes

Se crean dos redes porque eso lo pide el trabajo:

- `front-back-net`: conecta el frontend con el backend
- `back-db-net`: conecta el backend con la base de datos

Comandos:

```bash
docker network create front-back-net
docker network create back-db-net
```

## Volumen

El volumen se usa para guardar los datos de PostgreSQL.
Asi la informacion no se pierde facilmente.

Comando:

```bash
docker volume create postgres-data
```

## Base de datos

Primero se ejecuta PostgreSQL en la red `back-db-net`.
Tambien se le asigna el volumen `postgres-data`.

Comando:

```text
docker run -d --name postgres-db --network back-db-net -e POSTGRES_DB=tasksdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -v postgres-data:/var/lib/postgresql/data postgres:17-alpine
```

Significado rapido:

- `--name postgres-db`: nombre del contenedor
- `--network back-db-net`: lo conecta a la red del backend
- `-e ...`: define variables de entorno
- `-v postgres-data:/var/lib/postgresql/data`: conecta el volumen

## Backend en ejecucion

El backend se conecta primero a la red de base de datos, porque necesita hablar con PostgreSQL.

Comando:

```text
docker run -d --name back-app --network back-db-net -e PORT=3000 -e DB_HOST=postgres-db -e DB_PORT=5432 -e DB_NAME=tasksdb -e DB_USER=postgres -e DB_PASSWORD=postgres proyecto-back
```

Despues se conecta tambien a la red del frontend:

```bash
docker network connect front-back-net back-app
```

Esto se hace para que el backend quede en las dos redes:

- una red para hablar con la base de datos
- otra red para recibir las peticiones del frontend

## Frontend en ejecucion

El frontend se ejecuta en la red `front-back-net` y expone el puerto `8080` de tu computadora hacia el puerto `80` del contenedor.

Comando:

```text
docker run -d --name front-app --network front-back-net -p 8080:80 proyecto-front
```

## Como funciona todo

Cuando ya estan levantados los contenedores, funciona asi:

- El navegador entra a `http://localhost:8080`
- Nginx responde el frontend
- Nginx reenvia `/api/...` al contenedor `back-app`
- El backend consulta la base de datos `postgres-db`

## Acceso a la aplicacion

Cuando todo este corriendo, la aplicacion se abre en:

```text
http://localhost:8080
```

## Comandos para levantar todo

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

## Comandos utiles

Ver contenedores activos:

```bash
docker ps
```

Ver redes creadas:

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

## Pruebas realizadas

Para comprobar que la aplicacion si funciona, se hicieron pruebas creando tareas sencillas de ejemplo.

Algunos ejemplos usados:

- comprar pan
- ordenar el cuarto
- lavar la loza
- sacar la basura

Con esas tareas se comprobó lo siguiente:

- la pagina carga en el navegador
- se pueden crear tareas nuevas
- las tareas aparecen en la lista
- el estado de una tarea se puede cambiar
- la informacion queda guardada en la base de datos

## Resumen

Se uso Docker con cosas basicas:

- construccion de imagenes
- uso de redes
- uso de volumenes
- ejecucion manual de contenedores

Ademas, se cumplio con lo solicitado en el PDF:

- backend con framework
- frontend con framework
- frontend servido con Nginx
- Nginx como proxy inverso
- imagenes personalizadas
- multi-stage build
- dos redes Docker
- volumen para base de datos
- sin uso de `docker-compose`
