"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BABY_STAGES, BUDGETS, NO_BUY_REASONS, LEAD_STATUSES, AGENTS, STATUS_COLORS } from "@/lib/crm-options";

type Contact = {
  id: string;
  name: string;
  whatsapp?: string;
  babyStage?: string;
  budget?: string;
  status: string;
  agent?: string;
  nextFollowUp?: string;
  _count: { tasks: number };
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  firstContactDate: today(),
  name: "",
  whatsapp: "",
  babyStage: "",
  budget: "",
  mainQuestion: "",
  noBuyReason: "",
  status: "Nuevo",
  nextFollowUp: "",
  notes: "",
  agent: "",
});

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts);
  }, []);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp?.toLowerCase().includes(search.toLowerCase()) ||
      c.agent?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newContact = await res.json();
    setContacts([{ ...newContact, _count: { tasks: 0 } }, ...contacts]);
    setForm(emptyForm());
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este contacto?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts(contacts.filter((c) => c.id !== id));
  }

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";
  const label = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contactos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Nuevo contacto
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Fecha de primer contacto</label>
            <input type="date" value={form.firstContactDate} onChange={(e) => setForm({ ...form, firstContactDate: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Nombre completo *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Número de WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={field} placeholder="+52..." />
          </div>
          <div>
            <label className={label}>Edad del bebé o estado</label>
            <select value={form.babyStage} onChange={(e) => setForm({ ...form, babyStage: e.target.value })} className={field}>
              <option value="">— Selecciona —</option>
              {BABY_STAGES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Presupuesto aproximado</label>
            <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={field}>
              <option value="">— Selecciona —</option>
              {BUDGETS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Razón de no compra</label>
            <select value={form.noBuyReason} onChange={(e) => setForm({ ...form, noBuyReason: e.target.value })} className={field}>
              <option value="">— Selecciona —</option>
              {NO_BUY_REASONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Pregunta principal del cliente</label>
            <input value={form.mainQuestion} onChange={(e) => setForm({ ...form, mainQuestion: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Estado del lead</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={field}>
              {LEAD_STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Fecha del próximo seguimiento</label>
            <input type="date" value={form.nextFollowUp} onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} className={field} />
          </div>
          <div>
            <label className={label}>Agente que atiende</label>
            <select value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value })} className={field}>
              <option value="">— Selecciona —</option>
              {AGENTS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Observaciones del agente</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={field} />
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, WhatsApp o agente..."
        className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      />

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No hay contactos todavía.</p>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {c.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {c.whatsapp}{c.whatsapp && c.babyStage ? " · " : ""}{c.babyStage}
              </p>
            </div>
            {c.agent && <span className="text-xs text-gray-400 hidden sm:block">{c.agent}</span>}
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"}`}>
              {c.status}
            </span>
            <span className="text-xs text-gray-400">{c._count.tasks} tarea{c._count.tasks !== 1 ? "s" : ""}</span>
            <Link href={`/contacts/${c.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-600">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
