"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Task = { id: string; title: string; done: boolean; dueDate?: string; description?: string };
type Contact = { id: string; name: string; email?: string; phone?: string; company?: string; status: string; notes?: string; tasks: Task[] };

const STATUS_OPTIONS = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospecto" },
  { value: "customer", label: "Cliente" },
  { value: "inactive", label: "Inactivo" },
];

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    fetch(`/api/contacts/${id}`).then((r) => r.json()).then((data) => {
      setContact(data);
      setForm(data);
    });
  }, [id]);

  async function saveContact() {
    await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setContact({ ...contact!, ...form });
    setEditing(false);
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    setContact({
      ...contact!,
      tasks: contact!.tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t),
    });
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...taskForm, contactId: id, dueDate: taskForm.dueDate || null }),
    });
    const newTask = await res.json();
    setContact({ ...contact!, tasks: [newTask, ...contact!.tasks] });
    setTaskForm({ title: "", description: "", dueDate: "" });
    setAddingTask(false);
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setContact({ ...contact!, tasks: contact!.tasks.filter((t) => t.id !== taskId) });
  }

  if (!contact) return <div className="text-gray-400 py-20 text-center">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/contacts" className="text-sm text-blue-600 hover:underline mb-4 block">← Volver a contactos</Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {contact.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{contact.name}</h1>
              <p className="text-sm text-gray-400">{contact.company}</p>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="text-sm text-blue-600 hover:underline">
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>

        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            {(["name", "email", "phone", "company"] as const).map((f) => (
              <div key={f}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{f === "phone" ? "Teléfono" : f === "company" ? "Empresa" : f}</label>
                <input value={(form as any)[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Notas</label>
              <textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-500">Cancelar</button>
              <button onClick={saveContact} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-gray-400 text-xs">Email</dt><dd className="text-gray-700">{contact.email || "—"}</dd></div>
            <div><dt className="text-gray-400 text-xs">Teléfono</dt><dd className="text-gray-700">{contact.phone || "—"}</dd></div>
            <div><dt className="text-gray-400 text-xs">Empresa</dt><dd className="text-gray-700">{contact.company || "—"}</dd></div>
            <div><dt className="text-gray-400 text-xs">Estado</dt><dd className="text-gray-700">{STATUS_OPTIONS.find(o => o.value === contact.status)?.label}</dd></div>
            {contact.notes && <div className="col-span-2"><dt className="text-gray-400 text-xs">Notas</dt><dd className="text-gray-700">{contact.notes}</dd></div>}
          </dl>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Tareas ({contact.tasks.length})</h2>
          <button onClick={() => setAddingTask(!addingTask)} className="text-sm text-blue-600 hover:underline">+ Nueva tarea</button>
        </div>

        {addingTask && (
          <form onSubmit={addTask} className="border border-gray-100 rounded-xl p-4 mb-4 space-y-2 bg-gray-50">
            <input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Título de la tarea" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Descripción (opcional)" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAddingTask(false)} className="text-sm text-gray-400">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">Agregar</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {contact.tasks.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Sin tareas todavía.</p>}
          {contact.tasks.map((t) => (
            <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border ${t.done ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} className="mt-0.5 cursor-pointer" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.done ? "line-through text-gray-400" : "text-gray-700"}`}>{t.title}</p>
                {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                {t.dueDate && <p className="text-xs text-gray-400 mt-0.5">📅 {new Date(t.dueDate).toLocaleDateString("es-ES")}</p>}
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
