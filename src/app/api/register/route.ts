import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // El registro público solo se permite para crear el PRIMER usuario (admin).
  // Después, solo un admin puede crear usuarios desde el panel.
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    return NextResponse.json(
      { error: "El registro está cerrado. Pide a un administrador que cree tu cuenta." },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "admin" },
  });
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
