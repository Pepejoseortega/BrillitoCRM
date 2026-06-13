import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { UsersManager } from "@/components/UsersManager";

export default async function UsersPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/contacts");
  return <UsersManager currentUserId={admin.id} />;
}
