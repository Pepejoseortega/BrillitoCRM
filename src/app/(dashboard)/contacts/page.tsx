"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
  _count: { tasks: number };
};

const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  prospect: "Prospecto",
  customer: "Cliente",
  inactive: "Inactivo",
};

const STATUS_COLORS: Record<string, string> = {
  lead: "bg-yellow-100 text-yellow-700",
  prospect: "bg-blue-100 text-blue-700",
  customer: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", status: "lead" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/contacts").then((r) => r.json()).then(setContacts);
  }, []);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
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
    setForm({ name: "", email: "", phone: "", company: "", status: "lead" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este contacto?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts(contacts.filter((c) => c.id !== id));
  }

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
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {(["email", "phone", "company"] as const).map((f) => (
            <div key={f}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                {f === "phone" ? "Teléfono" : f === "company" ? "Empresa" : "Email"}
              </label>
              <input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
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
        placeholder="Buscar por nombre, empresa o email..."
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
              <p className="text-xs text-gray-400 truncate">{c.company}{c.company && c.email ? " · " : ""}{c.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
              {STATUS_LABELS[c.status]}
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
