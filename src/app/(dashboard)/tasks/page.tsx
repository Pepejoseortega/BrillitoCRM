"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  done: boolean;
  contact?: { id: string; name: string };
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks);
  }, []);

  const filtered = tasks.filter((t) =>
    filter === "all" ? true : filter === "pending" ? !t.done : t.done
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
    });
    const newTask = await res.json();
    setTasks([newTask, ...tasks]);
    setForm({ title: "", description: "", dueDate: "" });
    setShowForm(false);
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    setTasks(tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  }

  const pending = tasks.filter((t) => !t.done).length;
  const overdue = tasks.filter((t) => !t.done && t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tareas</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pending} pendiente{pending !== 1 ? "s" : ""}{overdue > 0 ? ` · ${overdue} vencida${overdue !== 1 ? "s" : ""}` : ""}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Nueva tarea
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-3">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título de la tarea" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {(["all", "pending", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"}`}>
            {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Completadas"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No hay tareas aquí.</p>}
        {filtered.map((t) => {
          const isOverdue = !t.done && t.dueDate && new Date(t.dueDate) < new Date();
          return (
            <div key={t.id} className={`flex items-start gap-3 p-4 rounded-2xl border bg-white ${isOverdue ? "border-red-200" : "border-gray-100"} shadow-sm`}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} className="mt-0.5 cursor-pointer" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.title}</p>
                {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                <div className="flex gap-3 mt-1">
                  {t.dueDate && (
                    <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      📅 {new Date(t.dueDate).toLocaleDateString("es-ES")}{isOverdue ? " — Vencida" : ""}
                    </span>
                  )}
                  {t.contact && (
                    <Link href={`/contacts/${t.contact.id}`} className="text-xs text-blue-500 hover:underline">
                      👤 {t.contact.name}
                    </Link>
                  )}
                </div>
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-xs text-red-400 hover:text-red-600 mt-0.5">✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
