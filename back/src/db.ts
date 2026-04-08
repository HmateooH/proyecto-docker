import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "tasksdb",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres"
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const result = await pool.query("SELECT COUNT(*)::int AS total FROM tasks");
  const total = result.rows[0]?.total ?? 0;

  if (total === 0) {
    await pool.query(`
      INSERT INTO tasks (title, status)
      VALUES
        ('Comprar pan', 'pendiente'),
        ('Ordenar el cuarto', 'completada'),
        ('Lavar la loza', 'pendiente'),
        ('Sacar la basura', 'completada')
    `);
  }
}
