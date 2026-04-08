import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { initializeDatabase, pool } from "./db.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*"
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  const now = await pool.query("SELECT NOW() AS now");
  res.json({
    ok: true,
    databaseTime: now.rows[0]?.now
  });
});

app.get("/api/tasks", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, title, status, created_at FROM tasks ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

app.post("/api/tasks", async (req, res) => {
  const title = String(req.body?.title ?? "").trim();

  if (!title) {
    res.status(400).json({ message: "El titulo es obligatorio." });
    return;
  }

  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, status, created_at",
    [title]
  );

  res.status(201).json(result.rows[0]);
});

app.patch("/api/tasks/:id/toggle", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "ID invalido." });
    return;
  }

  const result = await pool.query(
    `UPDATE tasks
     SET status = CASE WHEN status = 'completada' THEN 'pendiente' ELSE 'completada' END
     WHERE id = $1
     RETURNING id, title, status, created_at`,
    [id]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ message: "Tarea no encontrada." });
    return;
  }

  res.json(result.rows[0]);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Error interno del servidor." });
});

async function start() {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Backend escuchando en el puerto ${port}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar la aplicacion", error);
  process.exit(1);
});
