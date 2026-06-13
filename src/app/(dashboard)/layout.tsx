import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-4 gap-2">
        <p className="font-bold text-lg text-blue-600 mb-4 px-2">BrillitoCRM</p>
        <Link href="/contacts" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-sm font-medium">
          👥 Contactos
        </Link>
        <Link href="/tasks" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition text-sm font-medium">
          ✅ Tareas
        </Link>
        <div className="mt-auto">
          <p className="text-xs text-gray-400 px-2 mb-2">{session.user?.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
