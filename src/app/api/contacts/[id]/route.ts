import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id as string | undefined;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, userId },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  });
  if (!contact) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const data = await req.json();
  const contact = await prisma.contact.updateMany({
    where: { id: params.id, userId },
    data,
  });
  return NextResponse.json(contact);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.contact.deleteMany({ where: { id: params.id, userId } });
  return NextResponse.json({ ok: true });
}
