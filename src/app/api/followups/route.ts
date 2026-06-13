import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Devuelve los seguimientos pendientes (tareas con followUpStage) que vencen
// hoy o antes, excluyendo los contactos cuyo estado es "Descartado".
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;

  // Fin del día de hoy (incluye los vencidos y los de hoy)
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      done: false,
      followUpStage: { not: null },
      dueDate: { lte: endOfToday },
      contact: { is: { status: { not: "Descartado" } } },
    },
    orderBy: { dueDate: "asc" },
    include: {
      contact: {
        select: { id: true, name: true, whatsapp: true, status: true, mainQuestion: true, agent: true },
      },
    },
  });

  return NextResponse.json(tasks);
}
