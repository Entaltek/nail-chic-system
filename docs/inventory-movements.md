#  Inventory Movements Module

## Descripción

El módulo **Inventory Movements** gestiona los movimientos de inventario (entradas y salidas) y actualiza automáticamente el stock del producto afectado.

Está diseñado para trabajar con distintos tipos de inventario dentro de la misma colección.

---

##  Arquitectura del Módulo

El módulo sigue arquitectura por capas:

movement

├── InventoryMovement.model.ts

├── InventoryMovement.repository.ts

├── InventoryMovement.service.ts

├── InventoryMovement.controller.ts

└── InventoryMovement.routes.ts


| Capa | Responsabilidad |
|------|-----------------|
| **Model** | Estructura de datos del movimiento |
| **Repository** | Acceso a Firestore |
| **Service** | Lógica de negocio (cálculo y validación de stock) |
| **Controller** | Manejo de peticiones HTTP |
| **Routes** | Definición de endpoints |

---

##  Lógica de Negocio

Al crear un movimiento, el sistema:

1. Valida que el producto exista.
2. Detecta automáticamente qué tipo de stock maneja el item:
   - `stockPieces` → consumibles por pieza
   - `currentStock` → líquidos, polvos, geles
3. Calcula el nuevo stock.
4. Evita que el stock quede en negativo.
5. Actualiza el inventario en Firestore.
6. Registra el movimiento en la colección `inventory_movements`.
7. Genera alertas de stock bajo (logs).

---

##  Endpoints

###  Crear Movimiento

**POST**

```json
/api/inventory-movements
```

#### Body

```json
{
  "itemId": "swarovski-mix",
  "type": "IN",
  "quantity": 50,
  "reason": "Compra proveedor"
}
```

---

| **Campo** | **Tipo** | **Requerido** | **Descripción** |
|------|------------|---|----------|
| *itemId* | string | ✅ | ID del producto |
| *type* | "IN" / "OUT" | ✅ | Tipo de movimiento |
| *quantity* | number | ✅ | Cantidad a sumar o restar |
| *reason* | string | x | Motivo de movimiento |

---

#### Respuesta Exitosa
```json
{
  "id": "uuid",
  "itemId": "swarovski-mix",
  "type": "IN",
  "quantity": 50,
  "createdAt": "2026-01-26T03:55:41.874Z"
}
```

#### Obtener Todos los Movimientos

**GET**

```json
/api/inventory-movements
```

#### Obtener Movimientos por Item

**GET**
```json
/api/inventory-movements/item/:itemId
```

### Reglas de Stock

| Tipo de Item | Campo de stock utilizado |
|------|-----------------|
| Consumibles por pieza | StockPieces |
| Consumibles por contenido | currentStock |
| Equipos | ❌ No permiten movimientos |

---

## Validaciones Importantes

- No se permiten valores undefined en Firestore.
- El stock nunca puede quedar en negativo.
- El campo de stock se detecta dinámicamente.
- Los equipos no aceptan movimientos.

---

## Colecciones Firestore
| Colección	| Descripción |
|------|--------------|
| inventoryItems | Productos del inventario|
|inventory_movements | Historial de movimientos|

---

## Estado del Módulo

✔ Registro de movimientos

✔ Actualización automática de stock

✔ Soporte para múltiples modelos de inventario

✔ Historial de auditoría

✔ Validaciones de negocio

✔ Sistema escalable