// Opciones de las listas desplegables del CRM (coinciden con el layout de Google Sheets)

export const BABY_STAGES = [
  "Embarazada",
  "Recién nacido de 0 a 3 meses",
  "3 a 6 meses",
  "6 a 12 meses",
  "1 a 2 años",
  "2 a 3 años",
  "No especificado",
];

export const BUDGETS = [
  "Menos de mil pesos",
  "Mil a dos mil pesos",
  "Dos mil a cuatro mil pesos",
  "Cuatro mil a seis mil pesos",
  "Más de seis mil pesos",
  "No especificado",
];

export const NO_BUY_REASONS = [
  "Precio muy alto",
  "No entiende el producto",
  "No tiene presupuesto ahorita",
  "Quiere pensar",
  "Prefiere desechables",
  "Otra razón",
  "Aún no decide",
];

export const LEAD_STATUSES = [
  "Nuevo",
  "En seguimiento",
  "Primer seguimiento enviado",
  "Segundo seguimiento enviado",
  "Tercer seguimiento enviado",
  "Cuarto seguimiento enviado",
  "Comprado",
  "Descartado",
];

// Nota: los agentes (columna 11) NO son una lista fija: se obtienen de los
// usuarios del sistema vía GET /api/agents.

// Colores para el estado del lead (para los badges en la UI)
export const STATUS_COLORS: Record<string, string> = {
  "Nuevo": "bg-blue-100 text-blue-700",
  "En seguimiento": "bg-yellow-100 text-yellow-700",
  "Primer seguimiento enviado": "bg-amber-100 text-amber-700",
  "Segundo seguimiento enviado": "bg-amber-100 text-amber-700",
  "Tercer seguimiento enviado": "bg-orange-100 text-orange-700",
  "Cuarto seguimiento enviado": "bg-orange-100 text-orange-700",
  "Comprado": "bg-green-100 text-green-700",
  "Descartado": "bg-gray-100 text-gray-500",
};
