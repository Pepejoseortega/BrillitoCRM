"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BABY_STAGES, BUDGETS, NO_BUY_REASONS, LEAD_STATUSES, STATUS_COLORS } from "@/lib/crm-options";

type Task = { id: string; title: string; done: boolean; dueDate?: string; description?: string };
type Contact = {
  id: string;
  name: string;
  whatsapp?: string;
  firstContactDate?: string;
  babyStage?: string;
  budget?: string;
  mainQuestion?: string;
  noBuyReason?: string;
  status: string;
  nextFollowUp?: string;
  notes?: string;
  agent?: string;
  tasks: Task[];
};

const dateInput = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const dateLabel = (d?: string) => (d ? new Date(d).toLocaleDateString("es-MX") : "—");

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [agents, setAgents] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then(setAgents);
    fetch(`/api/contacts/${id}`).then((r) => r.json()).then((data) => {
      setContact(data);
      setForm({
        ...data,
        firstContactDate: dateInput(data.firstContactDate),
        nextFollowUp: dateInput(data.nextFollowUp),
      });
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
    setContact({ ...contact!, tasks: contact!.tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t) });
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

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
  const lbl = "block text-xs text-gray-500 mb-1";

  const sel = (key: string, opts: string[]) => (
    <select value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={field}>
      <option value="">— Selecciona —</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/contacts" className="text-sm text-blue-600 hover:underline mb-4 block">← Volver a contactos</Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              {contact.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{contact.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[contact.status] || "bg-gray-100 text-gray-600"}`}>{contact.status}</span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="text-sm text-blue-600 hover:underline">
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>

        {editing ? (
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lbl}>Fecha de primer contacto</label><input type="date" value={form.firstContactDate ?? ""} onChange={(e) => setForm({ ...form, firstContactDate: e.target.value })} className={field} /></div>
            <div><label className={lbl}>Nombre completo</label><input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} /></div>
            <div><label className={lbl}>WhatsApp</label><input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={field} /></div>
            <div><label className={lbl}>Edad del bebé o estado</label>{sel("babyStage", BABY_STAGES)}</div>
            <div><label className={lbl}>Presupuesto</label>{sel("budget", BUDGETS)}</div>
            <div><label className={lbl}>Razón de no compra</label>{sel("noBuyReason", NO_BUY_REASONS)}</div>
            <div className="col-span-2"><label className={lbl}>Pregunta principal</label><input value={form.mainQuestion ?? ""} onChange={(e) => setForm({ ...form, mainQuestion: e.target.value })} className={field} /></div>
            <div><label className={lbl}>Estado del lead</label><select value={form.status ?? "Nuevo"} onChange={(e) => setForm({ ...form, status: e.target.value })} className={field}>{LEAD_STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
            <div><label className={lbl}>Próximo seguimiento</label><input type="date" value={form.nextFollowUp ?? ""} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} className={field} /></div>
            <div><label className={lbl}>Agente que atiende</label>{sel("agent", agents)}</div>
            <div className="col-span-2"><label className={lbl}>Observaciones del agente</label><textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={field} /></div>
            <div className="col-span-2 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-500">Cancelar</button>
              <button onClick={saveContact} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <Info label="Primer contacto" value={dateLabel(contact.firstContactDate)} />
            <Info label="WhatsApp" value={contact.whatsapp} />
            <Info label="Edad del bebé / estado" value={contact.babyStage} />
            <Info label="Presupuesto" value={contact.budget} />
            <Info label="Pregunta principal" value={contact.mainQuestion} span />
            <Info label="Razón de no compra" value={contact.noBuyReason} />
            <Info label="Próximo seguimiento" value={dateLabel(contact.nextFollowUp)} />
            <Info label="Agente" value={contact.agent} />
            <Info label="Observaciones" value={contact.notes} span />
          </dl>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Seguimientos / Tareas ({contact.tasks.length})</h2>
          <button onClick={() => setAddingTask(!addingTask)} className="text-sm text-blue-600 hover:underline">+ Nueva tarea</button>
        </div>

        {addingTask && (
          <form onSubmit={addTask} className="border border-gray-100 rounded-xl p-4 mb-4 space-y-2 bg-gray-50">
            <input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Título de la tarea" className={field} />
            <input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Descripción (opcional)" className={field} />
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className={field} />
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
                {t.dueDate && <p className="text-xs text-gray-400 mt-0.5">📅 {new Date(t.dueDate).toLocaleDateString("es-MX")}</p>}
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, span }: { label: string; value?: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-gray-400 text-xs">{label}</dt>
      <dd className="text-gray-700">{value || "—"}</dd>
    </div>
  );
}
