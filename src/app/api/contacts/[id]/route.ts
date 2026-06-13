import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id as string | undefined;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const contact = await prisma.contact.findFirst({
    where: { id, userId },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  if (!contact) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const raw = await req.json();
  const data: any = { ...raw };
  // No permitir sobrescribir relaciones / ids
  delete data.id; delete data.userId; delete data.tasks; delete data._count;
  delete data.createdAt; delete data.updatedAt;
  if (data.firstContactDate) data.firstContactDate = new Date(data.firstContactDate);
  if ("nextFollowUp" in data) data.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
  const contact = await prisma.contact.updateMany({
    where: { id, userId },
    data,
  });
  return NextResponse.json(contact);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.contact.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
