import { google } from "googleapis";

// Cliente de Google Sheets usando una cuenta de servicio.
// Variables de entorno necesarias:
//   GOOGLE_SHEETS_CLIENT_EMAIL  -> email de la cuenta de servicio
//   GOOGLE_SHEETS_PRIVATE_KEY   -> private key del JSON (con \n escapados)
//   GOOGLE_SHEET_ID             -> ID de la hoja (de la URL)
//   GOOGLE_SHEET_TAB            -> (opcional) nombre de la pestaña, por defecto "Hoja 1"

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) return null;

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
    process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
}

type ContactRow = {
  firstContactDate?: Date | string | null;
  name?: string | null;
  whatsapp?: string | null;
  babyStage?: string | null;
  budget?: string | null;
  mainQuestion?: string | null;
  noBuyReason?: string | null;
  status?: string | null;
  nextFollowUp?: Date | string | null;
  notes?: string | null;
  agent?: string | null;
};

function fmtDate(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// Obtiene el nombre de la primera pestaña de la hoja (para no depender de
// que se llame "Hoja 1" o "Sheet1"). Se puede forzar con GOOGLE_SHEET_TAB.
async function resolveTabName(sheets: any, spreadsheetId: string) {
  if (process.env.GOOGLE_SHEET_TAB) return process.env.GOOGLE_SHEET_TAB;
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
  return meta.data.sheets?.[0]?.properties?.title || "Hoja 1";
}

// Agrega una fila al final de la hoja con el orden exacto de las 11 columnas.
export async function appendContactToSheet(c: ContactRow) {
  const auth = getAuth();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!auth || !spreadsheetId) {
    console.warn("[sheets] No configurado, se omite el envío a Google Sheets.");
    return;
  }
  const sheets = google.sheets({ version: "v4", auth });
  const tab = await resolveTabName(sheets, spreadsheetId);

  const row = [
    fmtDate(c.firstContactDate),   // Col 1
    c.name ?? "",                   // Col 2
    c.whatsapp ?? "",               // Col 3
    c.babyStage ?? "",              // Col 4
    c.budget ?? "",                 // Col 5
    c.mainQuestion ?? "",           // Col 6
    c.noBuyReason ?? "",            // Col 7
    c.status ?? "",                 // Col 8
    fmtDate(c.nextFollowUp),        // Col 9
    c.notes ?? "",                  // Col 10
    c.agent ?? "",                  // Col 11
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:K`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
