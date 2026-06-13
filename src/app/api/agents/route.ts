import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Devuelve la lista de agentes (= usuarios del sistema) para poblar el
// dropdown "Agente que atiende". Accesible para cualquier usuario logueado.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  const agents = users.map((u) => u.name?.trim() || u.email);
  return NextResponse.json(agents);
}
