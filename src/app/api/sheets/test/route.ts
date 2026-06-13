import { NextResponse } from "next/server";
import { google } from "googleapis";
import { requireAdmin } from "@/lib/admin";

// Endpoint de diagnóstico (solo admin): verifica la conexión con Google Sheets
// y devuelve un mensaje claro de qué está pasando.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const checks: Record<string, any> = {
    GOOGLE_SHEETS_CLIENT_EMAIL: clientEmail ? `OK (${clientEmail})` : "❌ FALTA",
    GOOGLE_SHEETS_PRIVATE_KEY: privateKey
      ? privateKey.includes("BEGIN PRIVATE KEY")
        ? "OK"
        : "⚠️ presente pero no parece una llave válida"
      : "❌ FALTA",
    GOOGLE_SHEET_ID: spreadsheetId ? `OK (${spreadsheetId})` : "❌ FALTA",
  };

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return NextResponse.json({ ok: false, step: "env-vars", checks }, { status: 200 });
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties.title,sheets.properties.title",
    });
    return NextResponse.json({
      ok: true,
      checks,
      spreadsheetTitle: meta.data.properties?.title,
      tabs: meta.data.sheets?.map((s) => s.properties?.title),
      message: "✅ Conexión exitosa. La hoja está compartida correctamente.",
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: "google-api",
      checks,
      error: err?.message || String(err),
      hint:
        err?.message?.includes("permission") || err?.code === 403
          ? "La hoja NO está compartida con el client_email como Editor. Compártela y reintenta."
          : err?.message?.includes("not found") || err?.code === 404
          ? "El GOOGLE_SHEET_ID es incorrecto."
          : "Revisa que el private_key esté completo y bien pegado.",
    }, { status: 200 });
  }
}
