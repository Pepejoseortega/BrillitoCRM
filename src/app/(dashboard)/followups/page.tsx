"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FollowUp = {
  id: string;
  followUpStage: number;
  dueDate: string;
  done: boolean;
  contact: {
    id: string;
    name: string;
    whatsapp?: string;
    status: string;
    mainQuestion?: string;
    agent?: string;
  } | null;
};

const STAGES = [
  { n: 1, label: "Primer seguimiento", sub: "24 h después" },
  { n: 2, label: "Segundo seguimiento", sub: "3 días después" },
  { n: 3, label: "Tercer seguimiento", sub: "1 semana después" },
  { n: 4, label: "Cuarto seguimiento", sub: "2 semanas después" },
];

const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
const isOverdue = (d: string) => {
  const due = new Date(d); due.setHours(23, 59, 59, 999);
  return due < new Date() && !isToday(d);
};

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/followups")
      .then((r) => r.json())
      .then((d) => { setItems(d); setLoading(false); });
  }, []);

  async function markDone(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    setItems(items.filter((i) => i.id !== id));
  }

  const countFor = (n: number) => items.filter((i) => i.followUpStage === n).length;
  const visible = items.filter((i) => i.followUpStage === active && i.contact);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seguimientos de hoy</h1>
        <p className="text-sm text-gray-400 mt-0.5">Leads que debes contactar (los descartados no aparecen)</p>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STAGES.map((s) => {
          const count = countFor(s.n);
          return (
            <button
              key={s.n}
              onClick={() => setActive(s.n)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border text-left ${
                active === s.n
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {s.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === s.n ? "bg-white/25" : "bg-red-100 text-red-600"}`}>
                    {count}
                  </span>
                )}
              </div>
              <div className={`text-xs ${active === s.n ? "text-blue-100" : "text-gray-400"}`}>{s.sub}</div>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Cargando...</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-gray-500">No hay leads pendientes en este seguimiento.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {f.contact!.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{f.contact!.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {f.contact!.whatsapp}
                  {f.contact!.mainQuestion ? ` · ${f.contact!.mainQuestion}` : ""}
                </p>
              </div>
              {f.contact!.agent && <span className="text-xs text-gray-400 hidden sm:block">{f.contact!.agent}</span>}
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                isToday(f.dueDate) ? "bg-blue-100 text-blue-700" : isOverdue(f.dueDate) ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
              }`}>
                {isToday(f.dueDate) ? "Hoy" : isOverdue(f.dueDate) ? "Vencido" : new Date(f.dueDate).toLocaleDateString("es-MX")}
              </span>
              {f.contact!.whatsapp && (
                <a
                  href={`https://wa.me/${f.contact!.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  WhatsApp
                </a>
              )}
              <Link href={`/contacts/${f.contact!.id}`} className="text-xs text-blue-600 hover:underline">Ver</Link>
              <button onClick={() => markDone(f.id)} className="text-xs text-gray-500 hover:text-green-600 font-medium">✓ Hecho</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
