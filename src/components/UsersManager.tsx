"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
};

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Error al crear usuario");
      return;
    }
    setUsers([...users, data]);
    setForm({ name: "", email: "", password: "", role: "user" });
    setShowForm(false);
  }

  async function changeRole(user: User) {
    const newRole = user.role === "admin" ? "user" : "admin";
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    } else {
      const data = await res.json();
      alert(data.error || "No se pudo cambiar el rol");
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`¿Eliminar a ${user.name || user.email}?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== user.id));
    } else {
      const data = await res.json();
      alert(data.error || "No se pudo eliminar");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} usuario{users.length !== 1 ? "s" : ""} en el sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Nuevo usuario
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña *</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <p className="col-span-2 text-red-500 text-sm">{error}</p>}
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(u.name || u.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {u.name || "—"}
                {u.id === currentUserId && <span className="text-xs text-gray-400 font-normal"> (tú)</span>}
              </p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
              {u.role === "admin" ? "Administrador" : "Usuario"}
            </span>
            {u.id !== currentUserId && (
              <>
                <button onClick={() => changeRole(u)} className="text-xs text-blue-600 hover:underline">
                  {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                </button>
                <button onClick={() => handleDelete(u)} className="text-xs text-red-400 hover:text-red-600">Eliminar</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
