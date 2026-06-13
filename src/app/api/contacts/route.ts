import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendContactToSheet } from "@/lib/sheets";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;
  const contacts = await prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });
  return NextResponse.json(contacts);
}

// Normaliza los campos de fecha que llegan como string del formulario
function parseContactInput(data: any) {
  const out: any = { ...data };
  if (out.firstContactDate) out.firstContactDate = new Date(out.firstContactDate);
  else delete out.firstContactDate;
  if (out.nextFollowUp) out.nextFollowUp = new Date(out.nextFollowUp);
  else out.nextFollowUp = null;
  return out;
}

// Seguimientos automáticos: días después de la fecha de primer contacto
const FOLLOW_UPS = [
  { title: "Primer seguimiento", days: 1 },   // 24 horas
  { title: "Segundo seguimiento", days: 3 },  // 3 días
  { title: "Tercer seguimiento", days: 7 },   // 1 semana
  { title: "Cuarto seguimiento", days: 14 },  // 2 semanas
];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = parseContactInput(await req.json());
  const contact = await prisma.contact.create({ data: { ...data, userId } });

  // Crea las 4 tareas de seguimiento basadas en la fecha de primer contacto
  const base = contact.firstContactDate ?? new Date();
  await prisma.task.createMany({
    data: FOLLOW_UPS.map((f) => ({
      title: `${f.title} — ${contact.name}`,
      dueDate: addDays(base, f.days),
      contactId: contact.id,
      userId,
    })),
  });

  // Espeja el contacto en Google Sheets (no bloquea ni rompe si falla)
  try {
    await appendContactToSheet(contact);
  } catch (err) {
    console.error("[sheets] Error al agregar fila:", err);
  }

  return NextResponse.json(contact, { status: 201 });
}
