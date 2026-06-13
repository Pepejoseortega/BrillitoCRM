import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { dueDate: "asc" }],
    include: { contact: { select: { id: true, name: true } } },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = await req.json();
  const task = await prisma.task.create({ data: { ...data, userId } });
  return NextResponse.json(task, { status: 201 });
}
