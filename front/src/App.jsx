import { useEffect, useState } from "react";

const emptyForm = { title: "" };

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("No se pudieron cargar las tareas.");
      }

      const data = await response.json();
      setTasks(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message ?? "No se pudo crear la tarea.");
      }

      setForm(emptyForm);
      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(id) {
    setError("");

    try {
      const response = await fetch(`/api/tasks/${id}/toggle`, {
        method: "PATCH"
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea.");
      }

      await loadTasks();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <header className="header">
        <h1>Lista de tareas</h1>
        <p>Ejemplo simple usando frontend, backend y base de datos.</p>
      </header>

      <section className="grid">
        <article className="panel">
          <h2>Nueva tarea</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <label htmlFor="title">Titulo</label>
            <input
              id="title"
              name="title"
              placeholder="Ej. Comprar pan"
              value={form.title}
              onChange={(event) => setForm({ title: event.target.value })}
            />
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear tarea"}
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Lista de tareas</h2>
            <button type="button" className="ghost-button" onClick={() => void loadTasks()}>
              Recargar
            </button>
          </div>

          {error ? <p className="feedback error">{error}</p> : null}
          {loading ? <p className="feedback">Cargando tareas...</p> : null}

          {!loading && tasks.length === 0 ? (
            <p className="feedback">No hay tareas registradas todavia.</p>
          ) : null}

          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-card">
                <div>
                  <h3>{task.title}</h3>
                  <p>Estado: {task.status}</p>
                </div>
                <button type="button" onClick={() => void toggleTask(task.id)}>
                  Cambiar
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
