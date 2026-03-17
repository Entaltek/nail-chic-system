export type SuperCategoryType =
  | "CONSUMIBLES_BASICOS"
  | "QUIMICOS_GELES"
  | "DECORACION_CONTABLE"
  | "DECORACION_GRANEL"
  | "EQUIPO_HERRAMIENTAS";

export type VisualStockStatus = "lleno" | "medio" | "bajo";

// ✅ Lo que ya estás regresando en la API
export type InventoryVariant =
  | "EXACT_PIECE"
  | "DROP_CALCULATOR"
  | "VISUAL_STATUS"
  | "DEPRECIATION_MONTHLY";

export type MeasurementType = "PIECES" | "LIQUID" | "CUSTOM";

// (opcional) estructura de icon como en tu response actual
export type CategoryIcon = {
  bgClass: string;
};